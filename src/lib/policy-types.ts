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
