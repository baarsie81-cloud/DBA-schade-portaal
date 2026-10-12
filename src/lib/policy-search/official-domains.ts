/**
 * Conservatieve lijst met bekende officiële/productdomeinen.
 * Een match betekent alleen: mogelijk officiële bron — nog geen polisverificatie.
 */
const OFFICIAL_DOMAINS = [
  "abnamro.nl",
  "aegon.nl",
  "aig.com",
  "allianz.nl",
  "allianzdirect.nl",
  "anwb.nl",
  "ansvar.nl",
  "arag.nl",
  "asr.nl",
  "avero.nl",
  "bovemij.nl",
  "centraalbeheer.nl",
  "chubb.com",
  "das.nl",
  "goudse.nl",
  "deverende.nl",
  "enra.nl",
  "fbto.nl",
  "hemaverzekeringen.nl",
  "hiscox.nl",
  "ing.nl",
  "inshared.nl",
  "interpolis.nl",
  "kingpolis.nl",
  "klaverblad.nl",
  "laka.co",
  "lemonade.com",
  "nn.nl",
  "nationale-nederlanden.nl",
  "nh1816.nl",
  "ohra.nl",
  "promovendum.nl",
  "reaal.nl",
  "rhion.de",
  "snsbank.nl",
  "turien.nl",
  "unigarant.nl",
  "unive.nl",
  "vvaa.nl",
  "zelf.nl",
  "zlm.nl",
] as const;

export function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function isPossibleOfficialDomain(url: string): boolean {
  const hostname = extractHostname(url);
  if (!hostname) return false;
  return OFFICIAL_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}
