/**
 * Conservatieve lijst met bekende officiële/productdomeinen.
 * Een match betekent alleen: mogelijk officiële bron — nog geen polisverificatie.
 */
const OFFICIAL_DOMAINS = [
  "abnamro.nl",
  "abnamroverzekeringen.nl",
  "aegon.nl",
  "aig.com",
  "allianz.nl",
  "allianzdirect.nl",
  "anwb.nl",
  "ansvar.nl",
  "ansvar-idea.nl",
  "ansvaridea.nl",
  "arag.nl",
  "asr.nl",
  "avero.nl",
  "averoachmea.nl",
  "bovemij.nl",
  "centraalbeheer.nl",
  "chubb.com",
  "das.nl",
  "goudse.nl",
  "deverende.nl",
  "enra.nl",
  "fbto.nl",
  "hema.nl",
  "hemaverzekeringen.nl",
  "verzekeringen.hema.nl",
  "hiscox.nl",
  "ing.nl",
  "assets.ing.com",
  "inshared.nl",
  "interpolis.nl",
  "kingpolis.nl",
  "klaverblad.nl",
  "laka.co",
  "lemonade.com",
  "nn.nl",
  "nationale-nederlanden.nl",
  "nh1816.nl",
  "voorwaarden.nh1816.nl",
  "ohra.nl",
  "promovendum.nl",
  "reaal.nl",
  "rhion.de",
  "rhion.nl",
  "rhiondigital.nl",
  "snsbank.nl",
  "turien.nl",
  "mijnturien.nl",
  "unigarant.nl",
  "unive.nl",
  "vvaa.nl",
  "zelf.nl",
  "zlm.nl",
  "assets.zlm.nl",
  "voorwaarden.arag.nl",
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
