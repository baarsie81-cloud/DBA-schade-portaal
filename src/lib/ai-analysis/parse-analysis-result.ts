import type {
  AiAnalysisResult,
  AiAnalysisSource,
  AiCoverageAssessment,
} from "@/lib/ai-analysis/types";

export const AI_COVERAGE_ASSESSMENTS: AiCoverageAssessment[] = [
  "waarschijnlijk_gedekt",
  "mogelijk_gedekt",
  "onvoldoende_informatie",
  "waarschijnlijk_niet_gedekt",
];

export const AI_COVERAGE_ASSESSMENT_LABELS: Record<
  AiCoverageAssessment,
  string
> = {
  waarschijnlijk_gedekt: "Waarschijnlijk gedekt",
  mogelijk_gedekt: "Mogelijk gedekt",
  onvoldoende_informatie: "Onvoldoende informatie",
  waarschijnlijk_niet_gedekt: "Waarschijnlijk niet gedekt",
};

export type ParseAnalysisResult =
  | { ok: true; value: AiAnalysisResult }
  | { ok: false; error: string };

const DEFAULT_ERROR =
  "Het AI-antwoord heeft niet het verwachte formaat. Controleer of je het volledige antwoord uit ChatGPT of Copilot hebt gekopieerd.";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCoverageAssessment(value: unknown): value is AiCoverageAssessment {
  return (
    typeof value === "string" &&
    (AI_COVERAGE_ASSESSMENTS as string[]).includes(value)
  );
}

function stripMarkdownCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenced?.[1]) return fenced[1].trim();

  // Soms staat er tekst vóór/na een codeblok.
  const embedded = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (embedded?.[1]) return embedded[1].trim();

  return trimmed;
}

function extractJsonCandidate(raw: string): string {
  const withoutFences = stripMarkdownCodeFences(raw);
  if (withoutFences.startsWith("{") && withoutFences.endsWith("}")) {
    return withoutFences;
  }

  const firstBrace = withoutFences.indexOf("{");
  const lastBrace = withoutFences.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return withoutFences.slice(firstBrace, lastBrace + 1);
  }

  return withoutFences;
}

function parseSource(
  value: unknown,
  index: number,
): { ok: true; value: AiAnalysisSource } | { ok: false; error: string } {
  if (!isPlainObject(value)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} is geen geldig object.`,
    };
  }

  const { documentnaam, paginanummer, artikel, relevante_passage } = value;

  if (!isNonEmptyString(documentnaam)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} mist een geldige documentnaam.`,
    };
  }
  if (typeof paginanummer !== "number" || !Number.isFinite(paginanummer)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} mist een geldig paginanummer.`,
    };
  }
  if (!Number.isInteger(paginanummer) || paginanummer < 1) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} heeft een ongeldig paginanummer.`,
    };
  }
  if (!isNonEmptyString(artikel)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} mist een geldig artikel.`,
    };
  }
  if (!isNonEmptyString(relevante_passage)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Bron ${index + 1} mist een relevante passage.`,
    };
  }

  const allowedKeys = new Set([
    "documentnaam",
    "paginanummer",
    "artikel",
    "relevante_passage",
  ]);
  const extraKeys = Object.keys(value).filter((key) => !allowedKeys.has(key));
  if (extraKeys.length > 0) {
    // Extra velden negeren we niet hard, maar bewaren ze niet.
  }

  return {
    ok: true,
    value: {
      documentnaam: documentnaam.trim(),
      paginanummer,
      artikel: artikel.trim(),
      relevante_passage: relevante_passage.trim(),
    },
  };
}

/**
 * Parseert en valideert een geplakt AI-antwoord als AiAnalysisResult.
 * Geen eval; uitsluitend JSON.parse + structurele controles.
 */
export function parseAnalysisResult(rawInput: string): ParseAnalysisResult {
  if (!rawInput.trim()) {
    return {
      ok: false,
      error: "Plak eerst het AI-antwoord in het tekstveld.",
    };
  }

  const candidate = extractJsonCandidate(rawInput);

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    return { ok: false, error: DEFAULT_ERROR };
  }

  if (!isPlainObject(parsed)) {
    return { ok: false, error: DEFAULT_ERROR };
  }

  const requiredKeys = [
    "beoordeling",
    "samenvatting",
    "argumenten_voor",
    "argumenten_tegen",
    "bronnen",
    "ontbrekende_informatie",
    "conceptmail",
  ] as const;

  for (const key of requiredKeys) {
    if (!(key in parsed)) {
      return {
        ok: false,
        error: `${DEFAULT_ERROR} Het veld "${key}" ontbreekt.`,
      };
    }
  }

  if (!isCoverageAssessment(parsed.beoordeling)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "beoordeling" heeft een ongeldige waarde.`,
    };
  }

  if (!isNonEmptyString(parsed.samenvatting)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "samenvatting" moet een niet-lege tekst zijn.`,
    };
  }

  if (!isStringArray(parsed.argumenten_voor)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "argumenten_voor" moet een lijst van teksten zijn.`,
    };
  }

  if (!isStringArray(parsed.argumenten_tegen)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "argumenten_tegen" moet een lijst van teksten zijn.`,
    };
  }

  if (!Array.isArray(parsed.bronnen)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "bronnen" moet een lijst zijn.`,
    };
  }

  const bronnen: AiAnalysisSource[] = [];
  for (let index = 0; index < parsed.bronnen.length; index += 1) {
    const sourceResult = parseSource(parsed.bronnen[index], index);
    if (!sourceResult.ok) return sourceResult;
    bronnen.push(sourceResult.value);
  }

  if (!isStringArray(parsed.ontbrekende_informatie)) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "ontbrekende_informatie" moet een lijst van teksten zijn.`,
    };
  }

  if (typeof parsed.conceptmail !== "string" || !parsed.conceptmail.trim()) {
    return {
      ok: false,
      error: `${DEFAULT_ERROR} Het veld "conceptmail" moet een niet-lege tekst zijn.`,
    };
  }

  return {
    ok: true,
    value: {
      beoordeling: parsed.beoordeling,
      samenvatting: parsed.samenvatting.trim(),
      argumenten_voor: parsed.argumenten_voor.map((item) => item.trim()).filter(Boolean),
      argumenten_tegen: parsed.argumenten_tegen
        .map((item) => item.trim())
        .filter(Boolean),
      bronnen,
      ontbrekende_informatie: parsed.ontbrekende_informatie
        .map((item) => item.trim())
        .filter(Boolean),
      conceptmail: parsed.conceptmail.trim(),
    },
  };
}
