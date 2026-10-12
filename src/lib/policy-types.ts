/** Zoekgegevens afkomstig uit het verzekeringsformulier. */
export type PolicySearchInput = {
  insurerValue: string;
  insurerLabel: string;
  insurerOtherName: string;
  insuranceType: string;
  damageDate: string;
  policyConditionCode: string;
  coverageVariant: string;
};

/** Kandidaatdocument uit een zoekopdracht — nog geen bevestigde match. */
export type PolicyCandidate = {
  title: string;
  url: string;
  domain: string;
  description: string;
  sourceKind: "possible_official" | "other";
  /** Uit linktekst/titel herkend; geen geverifieerde documentmatch. */
  conditionCodeHint?: string | null;
  /** Merknaam uit de bronregistratie. */
  insurerName?: string;
};

export type PolicySearchStatus =
  | "idle"
  | "searching"
  | "setup_pending"
  | "not_implemented"
  | "manual_only"
  | "limited"
  | "candidates_found"
  | "no_match"
  | "error";

export const EMPTY_POLICY_SEARCH_INPUT: PolicySearchInput = {
  insurerValue: "",
  insurerLabel: "",
  insurerOtherName: "",
  insuranceType: "",
  damageDate: "",
  policyConditionCode: "",
  coverageVariant: "",
};

/** Documentsoort voor handmatige aanlevering of latere verificatie. */
export type PolicyDocumentType =
  | "polisblad"
  | "polisvoorwaarden"
  | "aanvullende_voorwaarden"
  | "overig";

export const POLICY_DOCUMENT_TYPE_OPTIONS: {
  value: PolicyDocumentType;
  label: string;
  hint?: string;
}[] = [
  {
    value: "polisblad",
    label: "Polisblad",
    hint: "Overzicht van dekking; bevat meestal niet de volledige voorwaarden.",
  },
  {
    value: "polisvoorwaarden",
    label: "Polisvoorwaarden",
    hint: "De product- of pakketvoorwaarden die bij de polis horen.",
  },
  {
    value: "aanvullende_voorwaarden",
    label: "Aanvullende voorwaarden / clausules",
  },
  {
    value: "overig",
    label: "Overig verzekeringsdocument",
  },
];

/**
 * Herkomst van een document voor de latere gezamenlijke verificatieroute.
 * Nog geen daadwerkelijke verificatie in deze stap.
 */
export type PolicyDocumentSourceKind = "online_official" | "manual_upload";

export type OnlinePolicyDocumentRef = {
  id: string;
  sourceKind: "online_official";
  documentType: PolicyDocumentType;
  title: string;
  url: string;
  domain: string;
};

export type ManualPolicyDocumentRef = {
  id: string;
  sourceKind: "manual_upload";
  documentType: PolicyDocumentType;
  fileName: string;
  sizeBytes: number;
  mimeType: string;
};

export type PolicyDocumentRef =
  | OnlinePolicyDocumentRef
  | ManualPolicyDocumentRef;
