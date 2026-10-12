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
  "Zoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.";

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
      status: "not_implemented";
      candidates: [];
      message: string;
    };

async function collectLinksFromPages(
  pageUrls: string[],
): Promise<{
  links: ExtractedDocumentLink[];
  fetchedOk: number;
  fetchErrors: OfficialHubFetchError[];
}> {
  const links: ExtractedDocumentLink[] = [];
  const seen = new Set<string>();
  const fetchErrors: OfficialHubFetchError[] = [];
  let fetchedOk = 0;

  // Pagina's parallel ophalen; fouten blijven per pagina geïsoleerd.
  const settled = await Promise.allSettled(
    pageUrls.map(async (pageUrl) => {
      const { html, finalUrl } = await fetchOfficialHubHtml(pageUrl);
      return extractDocumentLinks(html, finalUrl);
    }),
  );

  for (const result of settled) {
    if (result.status === "fulfilled") {
      fetchedOk += 1;
      for (const link of result.value) {
        const key = link.url.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        links.push(link);
      }
      continue;
    }

    const reason = result.reason;
    if (reason instanceof OfficialHubFetchError) {
      fetchErrors.push(reason);
    } else {
      fetchErrors.push(
        new OfficialHubFetchError(
          "De officiële website is momenteel niet bereikbaar.",
          502,
        ),
      );
    }
  }

  return { links, fetchedOk, fetchErrors };
}

async function searchEnabledSource(
  source: OfficialSource,
  input: PolicySearchInput,
): Promise<OfficialSearchResult> {
  const pageUrls = resolveSourcePageUrls(source, input.insuranceType);

  if (pageUrls.length === 0) {
    return {
      status: "no_match",
      candidates: [],
      message: `De officiële bron van ${source.name} kon niet automatisch worden gelezen.\n\n${UPLOAD_HINT}`,
    };
  }

  const { links, fetchedOk } = await collectLinksFromPages(pageUrls);

  if (fetchedOk === 0) {
    return {
      status: "no_match",
      candidates: [],
      message: `De officiële bron van ${source.name} is momenteel niet bereikbaar of kon niet automatisch worden gelezen.\n\n${UPLOAD_HINT}`,
    };
  }

  if (links.length === 0) {
    return {
      status: "no_match",
      candidates: [],
      message: `Op de officiële pagina's van ${source.name} zijn geen bruikbare polisdocumenten gevonden.\n\n${UPLOAD_HINT}`,
    };
  }

  const candidates = selectPolicyCandidates(links, input, 5);

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

  if (source.support !== "enabled") {
    return {
      status: "not_implemented",
      candidates: [],
      message:
        "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\n" +
        UPLOAD_HINT,
    };
  }

  return searchEnabledSource(source, input);
}
