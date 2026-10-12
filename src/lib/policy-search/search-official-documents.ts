import { extractDocumentLinks } from "@/lib/policy-search/extract-document-links";
import { fetchOfficialHubHtml } from "@/lib/policy-search/fetch-official-hub";
import {
  findOfficialSource,
  type OfficialSource,
} from "@/lib/policy-search/official-sources";
import { selectPolicyCandidates } from "@/lib/policy-search/rank-candidates";
import type { PolicyCandidate, PolicySearchInput } from "@/lib/policy-types";

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

async function searchEnabledSource(
  source: OfficialSource,
  input: PolicySearchInput,
): Promise<OfficialSearchResult> {
  const { html, finalUrl } = await fetchOfficialHubHtml(
    source.conditionsPageUrl,
  );
  const links = extractDocumentLinks(html, finalUrl);
  const candidates = selectPolicyCandidates(links, input, 5);

  if (candidates.length === 0) {
    return {
      status: "no_match",
      candidates: [],
      message:
        "De juiste polisvoorwaarden konden niet met voldoende zekerheid worden vastgesteld.",
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
        "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
    };
  }

  if (source.support !== "enabled") {
    return {
      status: "not_implemented",
      candidates: [],
      message:
        "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
    };
  }

  return searchEnabledSource(source, input);
}
