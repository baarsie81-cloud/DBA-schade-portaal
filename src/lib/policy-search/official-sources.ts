export type OfficialSourceSupport = "enabled" | "not_implemented";

export type OfficialSource = {
  /** Matcht `insurerValue` uit insurance-options. */
  insurerValue: string;
  name: string;
  domain: string;
  conditionsPageUrl: string;
  support: OfficialSourceSupport;
};

/**
 * Compacte registratie van geverifieerde officiële bronpagina's.
 * URL's komen uit het openbare onderzoek in stap 1.9B.
 */
export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    insurerValue: "nationale-nederlanden",
    name: "Nationale-Nederlanden",
    domain: "nn.nl",
    conditionsPageUrl:
      "https://www.nn.nl/Particulier/Klantenservice/Voorwaarden-particuliere-producten.htm",
    support: "enabled",
  },
  {
    insurerValue: "centraal-beheer",
    name: "Centraal Beheer",
    domain: "centraalbeheer.nl",
    conditionsPageUrl:
      "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
    support: "not_implemented",
  },
  {
    insurerValue: "a-s-r",
    name: "a.s.r.",
    domain: "asr.nl",
    conditionsPageUrl: "https://www.asr.nl/verzekeringen/voordeelpakket-van-asr",
    support: "not_implemented",
  },
  {
    insurerValue: "unive",
    name: "Univé",
    domain: "unive.nl",
    conditionsPageUrl: "https://www.unive.nl/documenten",
    support: "not_implemented",
  },
  {
    insurerValue: "allianz",
    name: "Allianz",
    domain: "allianz.nl",
    conditionsPageUrl:
      "https://www.allianz.nl/particulier/contact/documenten/voorwaarden.html",
    support: "not_implemented",
  },
];

export function findOfficialSource(
  insurerValue: string,
): OfficialSource | undefined {
  return OFFICIAL_SOURCES.find((source) => source.insurerValue === insurerValue);
}

export function isAllowedSourceHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return OFFICIAL_SOURCES.some(
    (source) =>
      normalized === source.domain || normalized.endsWith(`.${source.domain}`),
  );
}
