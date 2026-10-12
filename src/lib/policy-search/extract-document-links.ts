import { extractHostname } from "@/lib/policy-search/official-domains";
import { isAllowedSourceHostname } from "@/lib/policy-search/official-sources";

export type ExtractedDocumentLink = {
  title: string;
  url: string;
  domain: string;
  linkText: string;
  titleAttr: string;
  conditionCodeHint: string | null;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function stripTags(value: string): string {
  return decodeHtmlEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
}

function resolveUrl(href: string, baseUrl: string): string | null {
  try {
    const resolved = new URL(href, baseUrl);
    if (resolved.protocol !== "https:") return null;
    if (!isAllowedSourceHostname(resolved.hostname)) return null;
    resolved.hash = "";
    return resolved.toString();
  } catch {
    return null;
  }
}

function looksLikeDocumentLink(
  href: string,
  linkText: string,
  titleAttr: string,
): boolean {
  const haystack = `${href} ${linkText} ${titleAttr}`.toLowerCase();
  if (href.toLowerCase().includes(".pdf")) return true;
  if (titleAttr.toLowerCase().includes(".pdf")) return true;
  if (href.toLowerCase().includes("/download/")) return true;
  if (haystack.includes("polisvoorwaarden")) return true;
  if (haystack.includes("productvoorwaarden")) return true;
  if (haystack.includes("verzekeringsvoorwaarden")) return true;
  return /voorwaarden/.test(haystack);
}

/** Herkent veelvoorkomende NL voorwaardecodes uit openbare linkteksten. */
export function extractConditionCodeHint(text: string): string | null {
  const patterns = [
    /\bPP\s*[- ]?\s*\d{3,5}\s*[-–]\s*\d{2}\b/i,
    /\bUN[A-Z]{2,8}\s*[-–]?\s*\d{2}\b/i,
    /\bVP\s+[A-Z]{1,6}(?:-[A-Z]{1,6})?\s+\d{4}-\d{2}\b/i,
    /\b(?:INB|WOO|AVP|AUTO|OO|IO|IP|GLS|RBD|REIS|DR|PM|HUIS|AW|OP)-?[A-Z]*\s*\d{2}[A-Z]?\b/i,
    /\b(?:INB|WOO)-RV-\d{2}-\d{3}\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) return match[0].replace(/\s+/g, " ").trim();
  }
  return null;
}

/**
 * Extraheert documentlinks uit HTML van een allowlisted bronpagina.
 * Gebruikt alleen aanwezige href/titel/linktekst — verzint niets.
 */
export function extractDocumentLinks(
  html: string,
  baseUrl: string,
): ExtractedDocumentLink[] {
  const results: ExtractedDocumentLink[] = [];
  const seen = new Set<string>();
  const anchorRegex =
    /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;

  let match: RegExpExecArray | null;
  while ((match = anchorRegex.exec(html)) !== null) {
    const attrs = match[1] ?? "";
    const inner = match[2] ?? "";
    const hrefMatch = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (!hrefMatch?.[1]) continue;

    const href = hrefMatch[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:")) continue;

    const titleMatch = attrs.match(/\btitle\s*=\s*["']([^"']*)["']/i);
    const titleAttr = titleMatch?.[1] ? decodeHtmlEntities(titleMatch[1]) : "";
    const linkText = stripTags(inner);
    if (!looksLikeDocumentLink(href, linkText, titleAttr)) continue;

    const absoluteUrl = resolveUrl(href, baseUrl);
    if (!absoluteUrl) continue;

    const key = absoluteUrl.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const title = (linkText || titleAttr || absoluteUrl).slice(0, 220);
    const combined = `${linkText} ${titleAttr} ${absoluteUrl}`;
    results.push({
      title,
      url: absoluteUrl,
      domain: extractHostname(absoluteUrl),
      linkText,
      titleAttr,
      conditionCodeHint: extractConditionCodeHint(combined),
    });
  }

  return results;
}
