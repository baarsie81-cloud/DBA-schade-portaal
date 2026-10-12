/** Herkenbare verzekeringsmerken, labels en aanbieders (alfabetisch). */
export const INSURER_BRANDS = [
  "ABN AMRO Verzekeringen",
  "Aegon",
  "AIG",
  "Allianz",
  "Allianz Direct",
  "ANWB Verzekeringen",
  "Ansvar",
  "ARAG",
  "a.s.r.",
  "Avéro Achmea",
  "Bovemij",
  "Centraal Beheer",
  "Chubb",
  "DAS",
  "De Goudse",
  "De Vereende",
  "ENRA",
  "FBTO",
  "HEMA Verzekeringen",
  "Hiscox",
  "ING Verzekeringen",
  "InShared",
  "Interpolis",
  "Kingpolis",
  "Klaverblad",
  "Laka",
  "Lemonade",
  "Nationale-Nederlanden",
  "NH1816",
  "OHRA",
  "Promovendum",
  "Reaal",
  "Rhion",
  "SNS Verzekeringen",
  "Turien & Co.",
  "Unigarant",
  "Univé",
  "VvAA",
  "Zelf",
  "ZLM",
] as const;

export const INSURER_EXTRA_OPTIONS = [
  { value: "anders", label: "Anders" },
  { value: "onbekend", label: "Onbekend" },
] as const;

export type InsurerOption = {
  value: string;
  label: string;
  kind: "brand" | "extra";
};

function slugifyInsurer(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const INSURER_OPTIONS: InsurerOption[] = [
  ...[...INSURER_BRANDS]
    .sort((a, b) => a.localeCompare(b, "nl", { sensitivity: "base" }))
    .map((label) => ({
      value: slugifyInsurer(label),
      label,
      kind: "brand" as const,
    })),
  ...INSURER_EXTRA_OPTIONS.map((option) => ({
    ...option,
    kind: "extra" as const,
  })),
];

export const INSURANCE_TYPE_OPTIONS = [
  { value: "inboedel", label: "Inboedelverzekering" },
  { value: "opstal", label: "Opstal-/woonhuisverzekering" },
  {
    value: "avp",
    label: "Aansprakelijkheidsverzekering particulieren (AVP)",
  },
  { value: "auto", label: "Autoverzekering" },
  { value: "fiets", label: "Fietsverzekering" },
  { value: "reis", label: "Reisverzekering" },
  { value: "annulering", label: "Annuleringsverzekering" },
  { value: "rechtsbijstand", label: "Rechtsbijstandverzekering" },
  { value: "glas", label: "Glasverzekering" },
  { value: "kostbaarheden", label: "Kostbaarhedenverzekering" },
  { value: "buitenhuis", label: "Buitenhuisverzekering" },
  { value: "motor", label: "Motorverzekering" },
  { value: "scooter", label: "Scooter-/bromfietsverzekering" },
  { value: "caravan", label: "Caravanverzekering" },
  { value: "camper", label: "Camperverzekering" },
  { value: "boot", label: "Bootverzekering" },
  { value: "ongevallen", label: "Ongevallenverzekering" },
  { value: "svi", label: "Schadeverzekering inzittenden (SVI)" },
  { value: "huisdieren", label: "Huisdierenverzekering" },
  {
    value: "elektronica",
    label: "Elektronica-/apparatenverzekering",
  },
  { value: "cyber", label: "Cyberverzekering particulieren" },
  { value: "overig", label: "Overig / niet zeker" },
] as const;
