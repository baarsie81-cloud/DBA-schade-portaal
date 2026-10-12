import { resolveDisplayInsuranceType } from "@/lib/policy-search/build-queries";
import type { ExtractedDocumentLink } from "@/lib/policy-search/extract-document-links";
import type { PolicyCandidate, PolicySearchInput } from "@/lib/policy-types";

function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function insuranceTypeKeywords(insuranceType: string): string[] {
  const label = resolveDisplayInsuranceType({
    insurerValue: "",
    insurerLabel: "",
    insurerOtherName: "",
    insuranceType,
    damageDate: "",
    policyConditionCode: "",
    coverageVariant: "",
  }).toLowerCase();

  const map: Record<string, string[]> = {
    inboedel: ["inboedel", "woonverzekering", "woon"],
    opstal: ["opstal", "woonhuis", "woonverzekering", "woon"],
    avp: ["aansprakelijkheid", "avp"],
    auto: ["auto", "personenauto", "motorrijtuig"],
    fiets: ["fiets"],
    reis: ["reis", "annulering"],
    annulering: ["annulering", "reis"],
    rechtsbijstand: ["rechtsbijstand", "rechtshulp"],
    glas: ["glas"],
    kostbaarheden: ["kostbaarheden", "buitenshuis"],
    buitenhuis: ["buitenshuis", "buitenhuis"],
    motor: ["motor"],
    scooter: ["scooter", "bromfiets", "brom"],
    caravan: ["caravan", "toercaravan", "vouwwagen"],
    camper: ["camper", "kampeerauto"],
    boot: ["boot", "woonboot"],
    ongevallen: ["ongevallen"],
    svi: ["inzittenden", "svi"],
    huisdieren: ["huisdieren"],
    elektronica: ["elektronica", "apparaten", "mobiele"],
    cyber: ["cyber", "cyberservice"],
    overig: [],
  };

  const fromMap = map[insuranceType] ?? [];
  const fromLabel = label
    .split(/[^a-z0-9]+/i)
    .map((part) => part.toLowerCase())
    .filter((part) => part.length >= 4);

  return Array.from(new Set([...fromMap, ...fromLabel]));
}

function scoreLink(
  link: ExtractedDocumentLink,
  input: PolicySearchInput,
): number {
  const textHaystack = normalizeToken(
    `${link.title} ${link.linkText} ${link.titleAttr}`,
  );
  const fullHaystack = normalizeToken(
    `${link.title} ${link.linkText} ${link.titleAttr} ${link.url}`,
  );
  let score = 0;

  const code = input.policyConditionCode.trim();
  if (code) {
    const normalizedCode = normalizeToken(code);
    if (normalizedCode.length >= 4) {
      // Titel/linktekst weegt zwaarder: download-URL's bevatten soms een andere versie.
      if (textHaystack.includes(normalizedCode)) score += 120;
      else if (fullHaystack.includes(normalizedCode)) score += 40;
    }
  }

  for (const keyword of insuranceTypeKeywords(input.insuranceType)) {
    const normalized = normalizeToken(keyword);
    if (normalized && textHaystack.includes(normalized)) {
      score += 20;
    } else if (normalized && fullHaystack.includes(normalized)) {
      score += 8;
    }
  }

  const coverage = input.coverageVariant.trim();
  if (coverage) {
    const normalizedCoverage = normalizeToken(coverage);
    if (
      normalizedCoverage.length >= 2 &&
      textHaystack.includes(normalizedCoverage)
    ) {
      score += 10;
    }
  }

  // Lichte voorkeur voor polis-/productvoorwaarden boven generieke documenten.
  if (textHaystack.includes("polisvoorwaarden")) score += 5;
  if (textHaystack.includes("productvoorwaarden")) score += 3;
  if (textHaystack.includes("verzekeringsvoorwaarden")) score += 3;

  // Schadedatumjaartal is alleen context, geen bewijs.
  const year = input.damageDate.slice(0, 4);
  if (/^\d{4}$/.test(year) && textHaystack.includes(year)) {
    score += 1;
  }

  return score;
}

export function selectPolicyCandidates(
  links: ExtractedDocumentLink[],
  input: PolicySearchInput,
  maxCandidates = 5,
): PolicyCandidate[] {
  const ranked = links
    .map((link) => ({ link, score: scoreLink(link, input) }))
    .filter((entry) => {
      // Zonder code: alleen kandidaten die iets met de verzekeringscategorie delen.
      if (input.policyConditionCode.trim()) return entry.score > 0;
      return entry.score >= 20;
    })
    .sort((a, b) => b.score - a.score || a.link.title.localeCompare(b.link.title, "nl"));

  // Als filtering te streng is, val terug op top-scorers met enige score.
  const pool =
    ranked.length > 0
      ? ranked
      : links
          .map((link) => ({ link, score: scoreLink(link, input) }))
          .filter((entry) => entry.score > 0)
          .sort((a, b) => b.score - a.score);

  return pool.slice(0, maxCandidates).map(({ link }) => ({
    title: link.title,
    url: link.url,
    domain: link.domain,
    description: "",
    sourceKind: "possible_official" as const,
    conditionCodeHint: link.conditionCodeHint,
  }));
}
