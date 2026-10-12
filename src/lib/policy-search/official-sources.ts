export type OfficialSourceSupport = "enabled" | "not_implemented";

export type OfficialSource = {
  /** Matcht `insurerValue` uit insurance-options. */
  insurerValue: string;
  name: string;
  domain: string;
  /**
   * Primaire officiële hub-/overzichtspagina's.
   * Alleen geverifieerde HTTPS-URL's op het merkdomein.
   */
  conditionsPageUrls: string[];
  /**
   * Optionele productpagina's per verzekeringstype.
   * Worden samen met hubs gebruikt, max. 3 pagina's per zoekactie.
   */
  productPageUrlsByType?: Partial<Record<string, string[]>>;
  support: OfficialSourceSupport;
};

/** Maximaal aantal officiële bronpagina's per zoekactie. */
export const MAX_SOURCE_PAGES_PER_SEARCH = 3;

/**
 * Compacte registratie van geverifieerde officiële bronpagina's.
 * URL's komen uit het openbare onderzoek (1.9B) en daaraan gekoppelde
 * officiële product-/overzichtspagina's op hetzelfde merkdomein.
 */
export const OFFICIAL_SOURCES: OfficialSource[] = [
  {
    insurerValue: "nationale-nederlanden",
    name: "Nationale-Nederlanden",
    domain: "nn.nl",
    conditionsPageUrls: [
      "https://www.nn.nl/Particulier/Klantenservice/Voorwaarden-particuliere-producten.htm",
    ],
    support: "enabled",
  },
  {
    insurerValue: "centraal-beheer",
    name: "Centraal Beheer",
    domain: "centraalbeheer.nl",
    conditionsPageUrls: [
      "https://www.centraalbeheer.nl/verzekeringen/polisvoorwaarden",
    ],
    productPageUrlsByType: {
      inboedel: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      opstal: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      avp: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      glas: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      kostbaarheden: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      buitenhuis: [
        "https://www.centraalbeheer.nl/verzekeringen/woonverzekering/voorwaarden-en-meer",
      ],
      auto: [
        "https://www.centraalbeheer.nl/verzekeringen/autoverzekering/polisvoorwaarden",
      ],
      fiets: [
        "https://www.centraalbeheer.nl/verzekeringen/fietsverzekering/voorwaarden-en-meer",
      ],
      motor: [
        "https://www.centraalbeheer.nl/verzekeringen/motorverzekering/voorwaarden-en-meer",
      ],
      scooter: [
        "https://www.centraalbeheer.nl/verzekeringen/bromfietsverzekering/voorwaarden-en-meer",
      ],
      camper: [
        "https://www.centraalbeheer.nl/verzekeringen/camperverzekering/voorwaarden-en-meer",
      ],
      reis: [
        "https://www.centraalbeheer.nl/verzekeringen/reisverzekering/voorwaarden-en-meer",
      ],
      annulering: [
        "https://www.centraalbeheer.nl/verzekeringen/annuleringsverzekering/voorwaarden-en-meer",
      ],
      ongevallen: [
        "https://www.centraalbeheer.nl/verzekeringen/ongevallenverzekering/voorwaarden-en-meer",
      ],
    },
    support: "enabled",
  },
  {
    insurerValue: "a-s-r",
    name: "a.s.r.",
    domain: "asr.nl",
    conditionsPageUrls: [
      "https://www.asr.nl/verzekeringen/voordeelpakket-van-asr",
      "https://www.asr.nl/verzekeringen/gangbare-voorwaarden-schadeverzekeringen",
    ],
    support: "enabled",
  },
  {
    insurerValue: "unive",
    name: "Univé",
    domain: "unive.nl",
    conditionsPageUrls: ["https://www.unive.nl/documenten"],
    support: "enabled",
  },
  {
    insurerValue: "allianz",
    name: "Allianz",
    domain: "allianz.nl",
    conditionsPageUrls: [
      "https://www.allianz.nl/particulier/contact/documenten/voorwaarden.html",
    ],
    support: "enabled",
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

/**
 * Kiest tot MAX_SOURCE_PAGES_PER_SEARCH officiële pagina's voor één zoekactie.
 * Productpagina's voor het gekozen type gaan voor; daarna hubs.
 */
export function resolveSourcePageUrls(
  source: OfficialSource,
  insuranceType: string,
): string[] {
  const ordered: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | undefined) => {
    if (!url) return;
    const key = url.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(url);
  };

  for (const url of source.productPageUrlsByType?.[insuranceType] ?? []) {
    add(url);
  }
  for (const url of source.conditionsPageUrls) {
    add(url);
  }

  return ordered.slice(0, MAX_SOURCE_PAGES_PER_SEARCH);
}
