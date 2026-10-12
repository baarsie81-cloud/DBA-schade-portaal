import type { AiAnalysisResult, AiAnalysisSource } from "@/lib/ai-analysis/types";

export type VerifiableDocumentPage = {
  pageNumber: number;
  text: string;
};

/** Minimale documentvorm voor bronverificatie — UI-onafhankelijk. */
export type VerifiableDocument = {
  id: string;
  fileName: string;
  pages: VerifiableDocumentPage[];
};

export type SourceVerificationStatus =
  | "verified"
  | "partially_verified"
  | "unverified";

export type SourceVerificationResult = {
  source: AiAnalysisSource;
  status: SourceVerificationStatus;
  explanation: string;
  matchedDocumentId: string | null;
  matchedFileName: string | null;
  pageFound: boolean;
  passageFound: boolean;
  articleFound: boolean;
};

export type SourceVerificationSummary = {
  results: SourceVerificationResult[];
  verifiedCount: number;
  partiallyVerifiedCount: number;
  unverifiedCount: number;
  hasIncompleteSources: boolean;
};

export const SOURCE_VERIFICATION_STATUS_LABELS: Record<
  SourceVerificationStatus,
  string
> = {
  verified: "Geverifieerd",
  partially_verified: "Gedeeltelijk geverifieerd",
  unverified: "Niet geverifieerd",
};

function normalizeUnicode(value: string): string {
  return value.normalize("NFKC");
}

/** Conservatieve normalisatie voor bestands-/documentnamen. */
export function normalizeDocumentName(value: string): string {
  return normalizeUnicode(value)
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[_./\\]+/g, " ")
    .replace(/-+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Normalisatie voor tekstvergelijking:
 * hoofdletters, witruimte, regeleinden, Unicode, afbreekstreepjes.
 */
export function normalizeComparableText(value: string): string {
  return normalizeUnicode(value)
    .replace(/\u00ad/g, "") // soft hyphen
    .replace(/(\w)-\s*\n\s*(\w)/g, "$1$2") // afbreekstreepje aan regeleinde
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function findMatchingDocuments(
  documentName: string,
  documents: VerifiableDocument[],
): VerifiableDocument[] {
  const target = normalizeDocumentName(documentName);
  if (!target) return [];

  return documents.filter((doc) => {
    const fileName = normalizeDocumentName(doc.fileName);
    return fileName === target;
  });
}

function findPage(
  document: VerifiableDocument,
  pageNumber: number,
): VerifiableDocumentPage | undefined {
  return document.pages.find((page) => page.pageNumber === pageNumber);
}

function passageMatchesPage(passage: string, pageText: string): boolean {
  const normalizedPassage = normalizeComparableText(passage);
  const normalizedPage = normalizeComparableText(pageText);
  if (!normalizedPassage || !normalizedPage) return false;
  // Alleen volledige genormaliseerde overeenkomst (substring), geen fuzzy woordscore.
  return normalizedPage.includes(normalizedPassage);
}

/**
 * Conservatieve artikelmatching.
 * Accepteert herkenbare opschriften als "Artikel 3", "Art. 3.1", niet enkel een los getal.
 */
export function articleMatchesInText(article: string, haystack: string): boolean {
  const normalizedArticle = normalizeComparableText(article);
  const normalizedHaystack = normalizeComparableText(haystack);
  if (!normalizedArticle || !normalizedHaystack) return false;

  // Losse getallen (bijv. "3") zijn nooit voldoende als artikelbewijs.
  if (/^\d+(?:\.\d+)*$/.test(normalizedArticle)) {
    return false;
  }

  const patterns = [
    /\bartikel\s+(\d+(?:\.\d+)*)\b/i,
    /\bart\.?\s*(\d+(?:\.\d+)*)\b/i,
    /\bartikelnummer\s+(\d+(?:\.\d+)*)\b/i,
  ];

  let referencedNumber: string | null = null;
  for (const pattern of patterns) {
    const match = normalizedArticle.match(pattern);
    if (match?.[1]) {
      referencedNumber = match[1];
      break;
    }
  }

  // Alleen herkenbare artikelopschriften mogen matchen.
  if (!referencedNumber) {
    return false;
  }

  // Volledige genormaliseerde opschriftstring (bijv. "artikel 3").
  if (normalizedHaystack.includes(normalizedArticle)) {
    return true;
  }

  const articlePatternsInDoc = [
    new RegExp(`\\bartikel\\s+${escapeRegExp(referencedNumber)}\\b`, "i"),
    new RegExp(`\\bart\\.?\\s*${escapeRegExp(referencedNumber)}\\b`, "i"),
  ];

  return articlePatternsInDoc.some((pattern) => pattern.test(normalizedHaystack));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function verifySingleSource(
  source: AiAnalysisSource,
  documents: VerifiableDocument[],
): SourceVerificationResult {
  const matches = findMatchingDocuments(source.documentnaam, documents);

  if (matches.length === 0) {
    return {
      source,
      status: "unverified",
      explanation:
        "Het genoemde document komt niet overeen met een uniek geselecteerd PDF-bestand.",
      matchedDocumentId: null,
      matchedFileName: null,
      pageFound: false,
      passageFound: false,
      articleFound: false,
    };
  }

  if (matches.length > 1) {
    return {
      source,
      status: "unverified",
      explanation:
        "Meerdere documenten komen overeen met de genoemde documentnaam. De bron is niet uniek geïdentificeerd.",
      matchedDocumentId: null,
      matchedFileName: null,
      pageFound: false,
      passageFound: false,
      articleFound: false,
    };
  }

  const document = matches[0]!;
  const page = findPage(document, source.paginanummer);

  if (!page) {
    return {
      source,
      status: "unverified",
      explanation: `Pagina ${source.paginanummer} bestaat niet in het geïdentificeerde document "${document.fileName}".`,
      matchedDocumentId: document.id,
      matchedFileName: document.fileName,
      pageFound: false,
      passageFound: false,
      articleFound: false,
    };
  }

  if (!page.text.trim()) {
    return {
      source,
      status: "unverified",
      explanation: `Pagina ${source.paginanummer} bevat geen leesbare tekst voor verificatie.`,
      matchedDocumentId: document.id,
      matchedFileName: document.fileName,
      pageFound: true,
      passageFound: false,
      articleFound: false,
    };
  }

  const passageFound = passageMatchesPage(source.relevante_passage, page.text);
  // Artikel bij voorkeur op dezelfde pagina; anders zoeken in het hele document (conservatief met opschrift).
  const articleOnPage = articleMatchesInText(source.artikel, page.text);
  const articleInDocument =
    articleOnPage ||
    document.pages.some((candidate) =>
      articleMatchesInText(source.artikel, candidate.text),
    );
  const articleFound = articleInDocument;

  if (passageFound && articleFound) {
    return {
      source,
      status: "verified",
      explanation:
        "Document uniek geïdentificeerd; pagina bestaat; relevante passage letterlijk bevestigd; artikelverwijzing aantoonbaar bevestigd.",
      matchedDocumentId: document.id,
      matchedFileName: document.fileName,
      pageFound: true,
      passageFound: true,
      articleFound: true,
    };
  }

  if (passageFound || articleFound) {
    const parts: string[] = [
      "Document en pagina komen overeen.",
    ];
    if (passageFound) {
      parts.push("De relevante passage is letterlijk bevestigd.");
    } else {
      parts.push(
        "De relevante passage is niet letterlijk teruggevonden (parafrase telt niet).",
      );
    }
    if (articleFound) {
      parts.push(
        articleOnPage
          ? "De artikelverwijzing is op de pagina herkend."
          : "De artikelverwijzing is elders in het document herkend.",
      );
    } else {
      parts.push(
        "De artikelverwijzing kon niet aantoonbaar worden bevestigd.",
      );
    }

    return {
      source,
      status: "partially_verified",
      explanation: parts.join(" "),
      matchedDocumentId: document.id,
      matchedFileName: document.fileName,
      pageFound: true,
      passageFound,
      articleFound,
    };
  }

  return {
    source,
    status: "unverified",
    explanation:
      "Document en pagina zijn gevonden, maar noch de relevante passage noch de artikelverwijzing kon worden bevestigd. Alleen een bestaand paginanummer is onvoldoende.",
    matchedDocumentId: document.id,
    matchedFileName: document.fileName,
    pageFound: true,
    passageFound: false,
    articleFound: false,
  };
}

/**
 * Verifieert AI-bronverwijzingen tegen lokaal uitgelezen PDF-tekst.
 * Volledig synchroon en client-side.
 */
export function verifyAnalysisSources(
  result: AiAnalysisResult,
  documents: VerifiableDocument[],
): SourceVerificationSummary {
  const results = result.bronnen.map((source) =>
    verifySingleSource(source, documents),
  );

  const verifiedCount = results.filter((item) => item.status === "verified").length;
  const partiallyVerifiedCount = results.filter(
    (item) => item.status === "partially_verified",
  ).length;
  const unverifiedCount = results.filter(
    (item) => item.status === "unverified",
  ).length;

  return {
    results,
    verifiedCount,
    partiallyVerifiedCount,
    unverifiedCount,
    hasIncompleteSources: partiallyVerifiedCount > 0 || unverifiedCount > 0,
  };
}
