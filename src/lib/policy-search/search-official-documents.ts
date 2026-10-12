import { extractDocumentLinks } from "@/lib/policy-search/extract-document-links";
import {
  fetchOfficialHubHtml,
  OfficialHubFetchError,
} from "@/lib/policy-search/fetch-official-hub";
import {
  findOfficialSource,
  resolveSourcePageUrls,
  type OfficialSource,
} from "@/lib/policy-search/official-sources";
import { selectPolicyCandidates } from "@/lib/policy-search/rank-candidates";
import type { ExtractedDocumentLink } from "@/lib/policy-search/extract-document-links";
import type { PolicyCandidate, PolicySearchInput } from "@/lib/policy-types";

const UPLOAD_HINT =
  "Zoek de toepasselijke voorwaarden in het interne systeem van DBA en upload deze handmatig.";

/** Totale zoekbudget per gebruikersactie (ms). */
const SEARCH_BUDGET_MS = 4_800;

export type OfficialSearchResult =
  | {
      status: "candidates_found";
      candidates: PolicyCandidate[];
      message: string;
    }
  | {
      status: "no_match";
      candidates: [];
      message: string;
    }
  | {
      status: "limited";
      candidates: PolicyCandidate[];
      message: string;
    }
  | {
      status: "manual_only";
      candidates: [];
      message: string;
    }
  | {
      status: "not_implemented";
      candidates: [];
      message: string;
    };

function manualMessage(sourceName: string, notes?: string): string {
  const detail = notes ? `${notes}\n\n` : "";
  return (
    `De juiste polisvoorwaarden konden niet automatisch worden vastgesteld.\n\n` +
    detail +
    UPLOAD_HINT
  );
}

async function collectLinksFromPages(
  pageUrls: string[],
): Promise<{
  links: ExtractedDocumentLink[];
  fetchedOk: number;
}> {
  const links: ExtractedDocumentLink[] = [];
  const seen = new Set<string>();
  let fetchedOk = 0;

  const settled = await Promise.allSettled(
    pageUrls.map(async (pageUrl) => {
      const { html, finalUrl } = await fetchOfficialHubHtml(pageUrl);
      return extractDocumentLinks(html, finalUrl);
    }),
  );

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    fetchedOk += 1;
    for (const link of result.value) {
      const key = link.url.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      links.push(link);
    }
  }

  return { links, fetchedOk };
}

async function searchFetchableSource(
  source: OfficialSource,
  input: PolicySearchInput,
): Promise<{
  candidates: PolicyCandidate[];
  fetchedOk: number;
  pageCount: number;
}> {
  const pageUrls = resolveSourcePageUrls(source, input.insuranceType);
  if (pageUrls.length === 0) {
    return { candidates: [], fetchedOk: 0, pageCount: 0 };
  }

  const collectPromise = collectLinksFromPages(pageUrls);
  const raced = await Promise.race([
    collectPromise.then((value) => ({ kind: "ok" as const, value })),
    new Promise<{ kind: "timeout" }>((resolve) =>
      setTimeout(() => resolve({ kind: "timeout" }), SEARCH_BUDGET_MS),
    ),
  ]);

  if (raced.kind === "timeout") {
    // Laat lopende fetches op de achtergrond aflopen; geef geen kandidaten.
    return { candidates: [], fetchedOk: 0, pageCount: pageUrls.length };
  }

  const { links, fetchedOk } = raced.value;
  const candidates = selectPolicyCandidates(
    links,
    input,
    5,
    source.name,
  );
  return { candidates, fetchedOk, pageCount: pageUrls.length };
}

async function searchEnabledSource(
  source: OfficialSource,
  input: PolicySearchInput,
): Promise<OfficialSearchResult> {
  try {
    const { candidates, fetchedOk, pageCount } = await searchFetchableSource(
      source,
      input,
    );

    if (pageCount === 0) {
      return {
        status: "no_match",
        candidates: [],
        message: manualMessage(source.name, source.notes),
      };
    }

    if (fetchedOk === 0) {
      return {
        status: "no_match",
        candidates: [],
        message:
          `De officiële bron van ${source.name} is momenteel niet bereikbaar of reageerde niet op tijd.\n\n` +
          UPLOAD_HINT,
      };
    }

    if (candidates.length === 0) {
      return {
        status: "no_match",
        candidates: [],
        message:
          "De juiste polisvoorwaarden konden niet met voldoende zekerheid worden vastgesteld.\n\n" +
          UPLOAD_HINT,
      };
    }

    return {
      status: "candidates_found",
      candidates,
      message:
        "Controleer of het gevonden document overeenkomt met de voorwaarden op het polisblad.",
    };
  } catch (error) {
    if (error instanceof OfficialHubFetchError) {
      return {
        status: "no_match",
        candidates: [],
        message: `${error.message}\n\n${UPLOAD_HINT}`,
      };
    }
    return {
      status: "no_match",
      candidates: [],
      message: manualMessage(source.name),
    };
  }
}

async function searchLimitedSource(
  source: OfficialSource,
  input: PolicySearchInput,
): Promise<OfficialSearchResult> {
  if (source.conditionsPageUrls.length === 0) {
    return {
      status: "limited",
      candidates: [],
      message: manualMessage(source.name, source.notes),
    };
  }

  try {
    const { candidates, fetchedOk } = await searchFetchableSource(source, input);
    if (candidates.length > 0) {
      return {
        status: "limited",
        candidates,
        message:
          `Beperkte resultaten voor ${source.name}. Controleer of het document overeenkomt met het polisblad.\n\n` +
          UPLOAD_HINT,
      };
    }

    if (fetchedOk === 0) {
      return {
        status: "limited",
        candidates: [],
        message: manualMessage(
          source.name,
          source.notes ??
            `Automatisch zoeken bij ${source.name} is beperkt of momenteel niet beschikbaar.`,
        ),
      };
    }

    return {
      status: "limited",
      candidates: [],
      message: manualMessage(source.name, source.notes),
    };
  } catch {
    return {
      status: "limited",
      candidates: [],
      message: manualMessage(source.name, source.notes),
    };
  }
}

export async function searchOfficialDocuments(
  input: PolicySearchInput,
): Promise<OfficialSearchResult> {
  const source = findOfficialSource(input.insurerValue);

  if (!source) {
    return {
      status: "not_implemented",
      candidates: [],
      message:
        "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\n" +
        UPLOAD_HINT,
    };
  }

  if (source.support === "manual_only") {
    return {
      status: "manual_only",
      candidates: [],
      message: manualMessage(source.name, source.notes),
    };
  }

  if (source.support === "limited") {
    return searchLimitedSource(source, input);
  }

  return searchEnabledSource(source, input);
}
