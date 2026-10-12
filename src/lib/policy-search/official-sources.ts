export type OfficialSourceSupport = "enabled" | "limited" | "manual_only";

export type OfficialSource = {
  /** Matcht `insurerValue` uit insurance-options. */
  insurerValue: string;
  name: string;
  /** Primair merkdomein (zonder www). */
  domain: string;
  /**
   * Extra toegestane hostnames voor documentlinks
   * (bijv. voorwaarden-subdomeinen), altijd merkgereLateerd.
   */
  allowedHostnames?: string[];
  /**
   * Primaire officiële hub-/overzichtspagina's.
   * Alleen geverifieerde HTTPS-URL's.
   */
  conditionsPageUrls: string[];
  /**
   * Optionele productpagina's per verzekeringstype.
   * Max. 3 pagina's per zoekactie i.c.m. hubs.
   */
  productPageUrlsByType?: Partial<Record<string, string[]>>;
  support: OfficialSourceSupport;
  /** Korte toelichting voor LIMITED/MANUAL_ONLY. */
  notes?: string;
};

/** Maximaal aantal officiële bronpagina's per zoekactie. */
export const MAX_SOURCE_PAGES_PER_SEARCH = 3;

/**
 * Registratie van alle 40 merken uit insurance-options.ts.
 * ENABLED = live HTML-hub geschikt voor automatische documentdetectie.
 * LIMITED = bron bekend, maar auto-zoeken beperkt/onvolledig.
 * MANUAL_ONLY = geen betrouwbare automatische zoekroute.
 */
export const OFFICIAL_SOURCES: OfficialSource[] = [
  // --- Bestaande werkende integraties ---
  {
    insurerValue: "nationale-nederlanden",
    name: "Nationale-Nederlanden",
    domain: "nn.nl",
    allowedHostnames: ["nationale-nederlanden.nl"],
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
    support: "limited",
    notes:
      "Officiële voorwaardenpagina bekend, maar automatische ophaal wordt geblokkeerd (Cloudflare).",
  },

  // --- Nieuwe ENABLED hubs (geverifieerd bereikbaar met documentlinks) ---
  {
    insurerValue: "ohra",
    name: "OHRA",
    domain: "ohra.nl",
    conditionsPageUrls: [
      "https://www.ohra.nl/autoverzekering/polisvoorwaarden",
      "https://www.ohra.nl/woonverzekeringen/polisvoorwaarden",
    ],
    productPageUrlsByType: {
      auto: ["https://www.ohra.nl/autoverzekering/polisvoorwaarden"],
      inboedel: ["https://www.ohra.nl/woonverzekeringen/polisvoorwaarden"],
      opstal: ["https://www.ohra.nl/woonverzekeringen/polisvoorwaarden"],
      avp: ["https://www.ohra.nl/woonverzekeringen/polisvoorwaarden"],
      kostbaarheden: [
        "https://www.ohra.nl/woonverzekeringen/polisvoorwaarden",
      ],
    },
    support: "enabled",
  },
  {
    insurerValue: "fbto",
    name: "FBTO",
    domain: "fbto.nl",
    conditionsPageUrls: [
      "https://www.fbto.nl/autoverzekering/documenten",
      "https://www.fbto.nl/woonverzekering/documenten",
    ],
    productPageUrlsByType: {
      auto: ["https://www.fbto.nl/autoverzekering/documenten"],
      inboedel: ["https://www.fbto.nl/woonverzekering/documenten"],
      opstal: ["https://www.fbto.nl/woonverzekering/documenten"],
      reis: ["https://www.fbto.nl/reisverzekering/documenten"],
      annulering: ["https://www.fbto.nl/reisverzekering/documenten"],
      ongevallen: ["https://www.fbto.nl/ongevallenverzekering/documenten"],
    },
    support: "enabled",
  },
  {
    insurerValue: "interpolis",
    name: "Interpolis",
    domain: "interpolis.nl",
    conditionsPageUrls: [
      "https://www.interpolis.nl/verzekeren/alles-in-een-polis/voorwaarden",
    ],
    productPageUrlsByType: {
      auto: [
        "https://www.interpolis.nl/verzekeren/autoverzekering/auto-alles-in-een-polis/voorwaarden",
      ],
    },
    support: "enabled",
  },
  {
    insurerValue: "nh1816",
    name: "NH1816",
    domain: "nh1816.nl",
    allowedHostnames: ["voorwaarden.nh1816.nl"],
    conditionsPageUrls: [
      "https://www.nh1816.nl/verzekeringen/polisvoorwaarden",
    ],
    support: "enabled",
    notes: "Documenten staan deels op voorwaarden.nh1816.nl (HTML/PDF-hub).",
  },
  {
    insurerValue: "arag",
    name: "ARAG",
    domain: "arag.nl",
    allowedHostnames: ["voorwaarden.arag.nl"],
    conditionsPageUrls: ["https://www.arag.nl/polisvoorwaarden/"],
    support: "enabled",
  },
  {
    insurerValue: "zlm",
    name: "ZLM",
    domain: "zlm.nl",
    allowedHostnames: ["assets.zlm.nl", "mijn.zlm.nl"],
    conditionsPageUrls: ["https://www.zlm.nl/voorwaarden"],
    support: "enabled",
  },
  {
    insurerValue: "unigarant",
    name: "Unigarant",
    domain: "unigarant.nl",
    conditionsPageUrls: ["https://www.unigarant.nl/polisvoorwaarden/"],
    productPageUrlsByType: {
      auto: ["https://www.unigarant.nl/polisvoorwaarden/autoverzekering/"],
      fiets: ["https://www.unigarant.nl/polisvoorwaarden/fietsverzekering/"],
    },
    support: "enabled",
  },
  {
    insurerValue: "allianz-direct",
    name: "Allianz Direct",
    domain: "allianzdirect.nl",
    conditionsPageUrls: ["https://www.allianzdirect.nl/downloads/"],
    support: "enabled",
  },

  // --- LIMITED: bron bekend, auto-zoeken beperkt ---
  {
    insurerValue: "avero-achmea",
    name: "Avéro Achmea",
    domain: "averoachmea.nl",
    conditionsPageUrls: [
      "https://www.averoachmea.nl/particulier/voorwaarden",
    ],
    support: "limited",
    notes:
      "Voorwaardenportaal aanwezig; openbare schade-PDF-lijst is beperkt/filterbaar.",
  },
  {
    insurerValue: "sns-verzekeringen",
    name: "SNS Verzekeringen",
    domain: "snsbank.nl",
    conditionsPageUrls: [
      "https://www.snsbank.nl/particulier/verzekeren/polisvoorwaarden.html",
    ],
    support: "limited",
    notes:
      "Overzichtspagina aanwezig; documenten via download-pagina's i.p.v. directe PDF-hub.",
  },
  {
    insurerValue: "klaverblad",
    name: "Klaverblad",
    domain: "klaverblad.nl",
    conditionsPageUrls: [
      "https://www.klaverblad.nl/particulier/polisvoorwaarden-aansprakelijkheidsverzekering-voor-particulieren",
    ],
    support: "limited",
    notes:
      "Productvoorwaarden deels als HTML-pagina; geen complete openbare PDF-hub gevonden.",
  },
  {
    insurerValue: "vvaa",
    name: "VvAA",
    domain: "vvaa.nl",
    allowedHostnames: ["media.umbraco.io"],
    conditionsPageUrls: [
      "https://www.vvaa.nl/verzekeringen/studentverzekeringen/studentenpakket",
    ],
    support: "limited",
    notes:
      "Openbare documenten vooral bij studentenpakket; geen volledige particuliere schade-hub.",
  },
  {
    insurerValue: "bovemij",
    name: "Bovemij",
    domain: "bovemij.nl",
    conditionsPageUrls: ["https://www.bovemij.nl/polisvoorwaarden"],
    support: "limited",
    notes: "Grote voorwaardenbibliotheek, vooral zakelijk/mobiliteit.",
  },
  {
    insurerValue: "inshared",
    name: "InShared",
    domain: "inshared.nl",
    conditionsPageUrls: [],
    support: "limited",
    notes:
      "Losse PDF-downloads bestaan (documenten/download/...), maar geen betrouwbare HTML-overzichtshub.",
  },
  {
    insurerValue: "hema-verzekeringen",
    name: "HEMA Verzekeringen",
    domain: "hemaverzekeringen.nl",
    allowedHostnames: ["verzekeringen.hema.nl", "hema.nl"],
    conditionsPageUrls: ["https://verzekeringen.hema.nl/"],
    support: "limited",
    notes:
      "Merkdomein bereikbaar; openbare, scrapebare voorwaardenhub is beperkt.",
  },
  {
    insurerValue: "anwb-verzekeringen",
    name: "ANWB Verzekeringen",
    domain: "anwb.nl",
    allowedHostnames: ["merk.anwb.nl", "unigarant.nl"],
    conditionsPageUrls: [],
    support: "limited",
    notes:
      "ANWB-producten lopen vaak via Unigarant; geen stabiele ANWB-eigen HTML-hub gevonden. Gebruik Unigarant of handmatige upload.",
  },
  {
    insurerValue: "abn-amro-verzekeringen",
    name: "ABN AMRO Verzekeringen",
    domain: "abnamroverzekeringen.nl",
    conditionsPageUrls: [
      "https://www.abnamroverzekeringen.nl/zakelijk/voorwaarden",
    ],
    support: "limited",
    notes:
      "Zakelijke voorwaardenpagina soms bereikbaar; particuliere documentselectie blijft onvolledig.",
  },
  {
    insurerValue: "turien-co",
    name: "Turien & Co.",
    domain: "turien.nl",
    allowedHostnames: ["mijnturien.nl"],
    conditionsPageUrls: ["https://www.turien.nl/polisvoorwaarden"],
    support: "limited",
    notes: "Merkpagina bereikbaar; openbare documentextractie is beperkt.",
  },

  // --- MANUAL_ONLY: geen betrouwbare automatische zoekroute ---
  {
    insurerValue: "aegon",
    name: "Aegon",
    domain: "aegon.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes:
      "Schadeactiviteiten grotendeels overgenomen; geen zelfstandige openbare Aegon-schadevoorwaardenhub. Geen a.s.r.-voorwaarden overnemen.",
  },
  {
    insurerValue: "reaal",
    name: "Reaal",
    domain: "reaal.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Historisch merk; geen betrouwbare openbare Reaal-schadehub gevonden.",
  },
  {
    insurerValue: "zelf",
    name: "Zelf",
    domain: "zelf.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen stabiele openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "ing-verzekeringen",
    name: "ING Verzekeringen",
    domain: "ing.nl",
    allowedHostnames: ["assets.ing.com"],
    conditionsPageUrls: [],
    support: "manual_only",
    notes:
      "Losse branded PDF's bestaan; geen openbare HTML-hub. Risicodrager kan NN zijn — niet automatisch overnemen.",
  },
  {
    insurerValue: "das",
    name: "DAS",
    domain: "das.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen betrouwbaar openbaar HTML-overzicht met downloadbare voorwaarden gevonden.",
  },
  {
    insurerValue: "de-goudse",
    name: "De Goudse",
    domain: "goudse.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen geverifieerde openbare particuliere voorwaardenhub gevonden.",
  },
  {
    insurerValue: "de-vereende",
    name: "De Vereende",
    domain: "deverende.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Domein/voorwaardenhub niet betrouwbaar bereikbaar voor automatische detectie.",
  },
  {
    insurerValue: "ansvar",
    name: "Ansvar",
    domain: "ansvar.nl",
    allowedHostnames: ["ansvar-idea.nl", "ansvaridea.nl"],
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen geverifieerde openbare voorwaardenhub gevonden.",
  },
  {
    insurerValue: "aig",
    name: "AIG",
    domain: "aig.com",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen NL particuliere openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "chubb",
    name: "Chubb",
    domain: "chubb.com",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen NL particuliere openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "hiscox",
    name: "Hiscox",
    domain: "hiscox.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare scrapebare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "enra",
    name: "ENRA",
    domain: "enra.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "rhion",
    name: "Rhion",
    domain: "rhion.de",
    allowedHostnames: ["rhion.nl", "rhiondigital.nl"],
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen stabiele openbare NL-voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "promovendum",
    name: "Promovendum",
    domain: "promovendum.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "kingpolis",
    name: "Kingpolis",
    domain: "kingpolis.nl",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "laka",
    name: "Laka",
    domain: "laka.co",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare NL-voorwaardenhub geverifieerd.",
  },
  {
    insurerValue: "lemonade",
    name: "Lemonade",
    domain: "lemonade.com",
    conditionsPageUrls: [],
    support: "manual_only",
    notes: "Geen openbare scrapebare NL-voorwaardenhub geverifieerd.",
  },
];

export function findOfficialSource(
  insurerValue: string,
): OfficialSource | undefined {
  return OFFICIAL_SOURCES.find((source) => source.insurerValue === insurerValue);
}

function hostnameAllowedForSource(
  hostname: string,
  source: OfficialSource,
): boolean {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  if (
    normalized === source.domain ||
    normalized.endsWith(`.${source.domain}`)
  ) {
    return true;
  }
  return (source.allowedHostnames ?? []).some(
    (allowed) =>
      normalized === allowed || normalized.endsWith(`.${allowed}`),
  );
}

export function isAllowedSourceHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^www\./, "");
  return OFFICIAL_SOURCES.some((source) =>
    hostnameAllowedForSource(normalized, source),
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

export function countSourcesBySupport(): Record<OfficialSourceSupport, number> {
  return OFFICIAL_SOURCES.reduce(
    (acc, source) => {
      acc[source.support] += 1;
      return acc;
    },
    { enabled: 0, limited: 0, manual_only: 0 },
  );
}
