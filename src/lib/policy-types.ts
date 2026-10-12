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

/** Documentgegevens zoals een latere API die zou kunnen teruggeven. */
export type PolicyDocument = {
  insurerName: string;
  insuranceTypeLabel: string;
  documentTitle: string;
  conditionCode: string;
  versionLabel: string;
  sourceUrl: string;
  sourceLabel: string;
};

export type PolicySearchStatus =
  | "idle"
  | "searching"
  | "exact_match"
  | "no_match";

export const EMPTY_POLICY_SEARCH_INPUT: PolicySearchInput = {
  insurerValue: "",
  insurerLabel: "",
  insurerOtherName: "",
  insuranceType: "",
  damageDate: "",
  policyConditionCode: "",
  coverageVariant: "",
};

/** Duidelijk herkenbare fictieve demo-gegevens (geen echte merken/bronnen). */
export const DEMO_POLICY_DOCUMENT: PolicyDocument = {
  insurerName: "Voorbeeldverzekeraar Demo",
  insuranceTypeLabel: "Voorbeeldverzekering",
  documentTitle: "Demo polisvoorwaarden — niet officieel",
  conditionCode: "DEMO-CODE-000",
  versionLabel: "Demoversie · 01-01-2024",
  sourceUrl: "https://example.invalid/demo-polisvoorwaarden",
  sourceLabel: "Voorbeeldbron (niet echt)",
};
