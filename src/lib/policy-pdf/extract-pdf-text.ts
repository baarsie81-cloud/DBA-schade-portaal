"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";
import type {
  ExtractedPdfDocument,
  ExtractedPdfPage,
  PolicyDocumentType,
} from "@/lib/policy-types";

/** Lokale worker uit /public — geen CDN. */
const LOCAL_WORKER_SRC = "/pdf.worker.min.mjs";
const EXTRACTION_TIMEOUT_MS = 45_000;

type PdfjsModule = typeof import("pdfjs-dist");

let pdfjsModulePromise: Promise<PdfjsModule> | null = null;
let workerConfigured = false;

async function loadPdfjs(): Promise<PdfjsModule> {
  if (!pdfjsModulePromise) {
    pdfjsModulePromise = import("pdfjs-dist");
  }
  const pdfjs = await pdfjsModulePromise;

  if (!workerConfigured && typeof window !== "undefined") {
    pdfjs.GlobalWorkerOptions.workerSrc = LOCAL_WORKER_SRC;
    workerConfigured = true;
  }

  return pdfjs;
}

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 0);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(message));
    }, ms);

    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function classifyExtractionError(error: unknown, pdfjs: PdfjsModule): string {
  if (error instanceof pdfjs.PasswordException) {
    return "Dit PDF-bestand is beveiligd met een wachtwoord en kan niet worden gelezen.";
  }
  if (error instanceof pdfjs.InvalidPDFException) {
    return "Dit PDF-bestand lijkt beschadigd of ongeldig en kan niet worden gelezen.";
  }
  if (error instanceof pdfjs.ResponseException) {
    return "Het PDF-bestand kon niet worden verwerkt.";
  }

  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  if (message.includes("timeout") || message.includes("tijdslimiet")) {
    return "De tekstextractie duurde te lang. Probeer een kleiner PDF-bestand.";
  }
  if (message.includes("password") || message.includes("encrypted")) {
    return "Dit PDF-bestand is beveiligd en kan niet worden gelezen.";
  }
  if (
    message.includes("worker") ||
    message.includes("failed to fetch") ||
    message.includes("dynamically imported module")
  ) {
    return "De lokale PDF-verwerker kon niet worden geladen. Vernieuw de pagina en probeer het opnieuw.";
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
 * Geen netwerkcalls met documentinhoud, geen logging van documenttekst.
 */
export async function extractPdfTextLocally(input: {
  file: File;
  documentType: PolicyDocumentType;
}): Promise<ExtractedPdfDocument> {
  const fileName = input.file.name;
  let pdfjs: PdfjsModule;

  try {
    pdfjs = await loadPdfjs();
  } catch {
    return {
      fileName,
      documentType: input.documentType,
      pageCount: 0,
      pages: [],
      totalTextLength: 0,
      status: "failed",
      errorMessage:
        "De lokale PDF-verwerker kon niet worden geladen. Vernieuw de pagina en probeer het opnieuw.",
    };
  }

  let pdf: PDFDocumentProxy | null = null;

  try {
    // Kopieer de bytes zodat overdracht naar de worker de File-buffer niet detacht.
    const source = await input.file.arrayBuffer();
    const data = new Uint8Array(source.slice(0));

    const loadingTask = pdfjs.getDocument({
      data,
      useSystemFonts: true,
      isEvalSupported: false,
      useWorkerFetch: false,
      isOffscreenCanvasSupported: false,
      disableAutoFetch: true,
      disableStream: true,
      stopAtErrors: false,
    });

    pdf = await withTimeout(
      loadingTask.promise,
      EXTRACTION_TIMEOUT_MS,
      "tijdslimiet bij openen van PDF",
    );

    const pageCount = pdf.numPages;
    const pages: ExtractedPdfPage[] = [];

    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      pages.push(await extractPageText(pdf, pageNumber));
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
      errorMessage: classifyExtractionError(error, pdfjs),
    };
  } finally {
    if (pdf) {
      try {
        void pdf.destroy();
      } catch {
        // Negeer opruimfouten; geen documentinhoud loggen.
      }
    }
  }
}
