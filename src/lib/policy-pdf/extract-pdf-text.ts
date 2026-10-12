"use client";

import {
  getDocument,
  GlobalWorkerOptions,
  PasswordException,
  ResponseException,
  InvalidPDFException,
  type PDFDocumentProxy,
} from "pdfjs-dist";
import type {
  ExtractedPdfDocument,
  ExtractedPdfPage,
  PolicyDocumentType,
} from "@/lib/policy-types";

/** Lokale worker uit /public — geen CDN. */
const LOCAL_WORKER_SRC = "/pdf.worker.min.mjs";

let workerConfigured = false;

function ensurePdfWorkerConfigured(): void {
  if (workerConfigured) return;
  if (typeof window === "undefined") return;
  GlobalWorkerOptions.workerSrc = LOCAL_WORKER_SRC;
  workerConfigured = true;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function classifyExtractionError(error: unknown): string {
  if (error instanceof PasswordException) {
    return "Dit PDF-bestand is beveiligd met een wachtwoord en kan niet worden gelezen.";
  }
  if (error instanceof InvalidPDFException) {
    return "Dit PDF-bestand lijkt beschadigd of ongeldig en kan niet worden gelezen.";
  }
  if (error instanceof ResponseException) {
    return "Het PDF-bestand kon niet worden verwerkt.";
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("password") || message.includes("encrypted")) {
    return "Dit PDF-bestand is beveiligd en kan niet worden gelezen.";
  }
  if (message.includes("invalid") || message.includes("corrupt")) {
    return "Dit PDF-bestand lijkt beschadigd of ongeldig en kan niet worden gelezen.";
  }

  return "De tekstextractie is onverwacht mislukt. Probeer een ander PDF-bestand.";
}

async function extractPageText(
  pdf: PDFDocumentProxy,
  pageNumber: number,
): Promise<ExtractedPdfPage> {
  const page = await pdf.getPage(pageNumber);
  try {
    const content = await page.getTextContent({
      includeMarkedContent: false,
    });
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return { pageNumber, text };
  } finally {
    page.cleanup();
  }
}

/**
 * Extraheert tekst uit een PDF uitsluitend in de browser.
 * Geen netwerkcalls, geen logging van documentinhoud.
 */
export async function extractPdfTextLocally(input: {
  file: File;
  documentType: PolicyDocumentType;
}): Promise<ExtractedPdfDocument> {
  ensurePdfWorkerConfigured();

  const fileName = input.file.name;
  let pdf: PDFDocumentProxy | null = null;

  try {
    const data = new Uint8Array(await input.file.arrayBuffer());
    const loadingTask = getDocument({
      data,
      useSystemFonts: true,
      isEvalSupported: false,
      useWorkerFetch: false,
      isOffscreenCanvasSupported: false,
      disableAutoFetch: true,
      disableStream: true,
      // Geen externe cMap-/font-CDN's.
      stopAtErrors: false,
    });

    pdf = await loadingTask.promise;
    const pageCount = pdf.numPages;
    const pages: ExtractedPdfPage[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      pages.push(await extractPageText(pdf, pageNumber));
      // Voorkom UI-blokkade bij grotere documenten.
      await yieldToUi();
    }

    const totalTextLength = pages.reduce(
      (sum, page) => sum + page.text.length,
      0,
    );

    if (totalTextLength === 0) {
      return {
        fileName,
        documentType: input.documentType,
        pageCount,
        pages,
        totalTextLength: 0,
        status: "empty",
        errorMessage:
          "In dit PDF-bestand is geen leesbare tekst gevonden. Gescande documenten zonder tekstlaag worden niet ondersteund (geen OCR).",
      };
    }

    return {
      fileName,
      documentType: input.documentType,
      pageCount,
      pages,
      totalTextLength,
      status: "ready",
    };
  } catch (error) {
    return {
      fileName,
      documentType: input.documentType,
      pageCount: 0,
      pages: [],
      totalTextLength: 0,
      status: "failed",
      errorMessage: classifyExtractionError(error),
    };
  } finally {
    if (pdf) {
      try {
        await pdf.destroy();
      } catch {
        // Negeer opruimfouten; geen documentinhoud loggen.
      }
    }
  }
}
