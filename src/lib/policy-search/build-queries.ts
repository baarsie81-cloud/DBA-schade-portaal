import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import type { PolicySearchInput } from "@/lib/policy-types";

function resolveInsurerName(input: PolicySearchInput): string {
  if (input.insurerValue === "anders") {
    return input.insurerOtherName.trim();
  }
  if (input.insurerValue === "onbekend") {
    return "";
  }
  return input.insurerLabel.trim();
}

function resolveInsuranceTypeLabel(value: string): string {
  return (
    INSURANCE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value.trim()
  );
}

function compactQuery(parts: Array<string | undefined | null>): string {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part && part.length > 0))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Bouwt maximaal twee gerichte NL-zoekopdrachten.
 * Geen schadeomschrijving of klantgegevens.
 */
export function buildPolicySearchQueries(input: PolicySearchInput): string[] {
  const insurer = resolveInsurerName(input);
  const insuranceType = resolveInsuranceTypeLabel(input.insuranceType);
  const code = input.policyConditionCode.trim();
  const coverage = input.coverageVariant.trim();
  const year = input.damageDate.trim().slice(0, 4);

  const queries: string[] = [];

  if (code) {
    queries.push(
      compactQuery([
        insurer,
        insuranceType,
        "polisvoorwaarden",
        code,
        "filetype:pdf",
      ]),
    );
    queries.push(
      compactQuery([
        insurer,
        code,
        "polisvoorwaarden",
        coverage || undefined,
        year || undefined,
      ]),
    );
  } else {
    queries.push(
      compactQuery([
        insurer,
        insuranceType,
        "polisvoorwaarden",
        coverage || undefined,
        "filetype:pdf",
      ]),
    );
    queries.push(
      compactQuery([
        insurer,
        insuranceType,
        "algemene voorwaarden",
        "polis",
        year || undefined,
        coverage || undefined,
      ]),
    );
  }

  return Array.from(new Set(queries.filter(Boolean))).slice(0, 2);
}

export function resolveDisplayInsurer(input: PolicySearchInput): string {
  return resolveInsurerName(input);
}

export function resolveDisplayInsuranceType(input: PolicySearchInput): string {
  return resolveInsuranceTypeLabel(input.insuranceType);
}
