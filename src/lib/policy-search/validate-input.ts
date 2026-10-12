import type { PolicySearchInput } from "@/lib/policy-types";

const MAX_LEN = {
  insurerLabel: 120,
  insurerOtherName: 120,
  insurerValue: 80,
  insuranceType: 80,
  damageDate: 10,
  policyConditionCode: 80,
  coverageVariant: 80,
} as const;

function asTrimmedString(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export type ValidatedPolicySearchInput = PolicySearchInput;

export function parsePolicySearchBody(
  body: unknown,
):
  | { ok: true; value: ValidatedPolicySearchInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Ongeldige zoekaanvraag." };
  }

  const raw = body as Record<string, unknown>;

  const value: PolicySearchInput = {
    insurerValue: asTrimmedString(raw.insurerValue, MAX_LEN.insurerValue),
    insurerLabel: asTrimmedString(raw.insurerLabel, MAX_LEN.insurerLabel),
    insurerOtherName: asTrimmedString(
      raw.insurerOtherName,
      MAX_LEN.insurerOtherName,
    ),
    insuranceType: asTrimmedString(raw.insuranceType, MAX_LEN.insuranceType),
    damageDate: asTrimmedString(raw.damageDate, MAX_LEN.damageDate),
    policyConditionCode: asTrimmedString(
      raw.policyConditionCode,
      MAX_LEN.policyConditionCode,
    ),
    coverageVariant: asTrimmedString(
      raw.coverageVariant,
      MAX_LEN.coverageVariant,
    ),
  };

  const hasInsurer =
    (value.insurerValue === "anders" && value.insurerOtherName.length > 0) ||
    (value.insurerValue === "onbekend" && false) ||
    (value.insurerValue.length > 0 &&
      value.insurerValue !== "anders" &&
      value.insurerValue !== "onbekend" &&
      value.insurerLabel.length > 0);

  if (!hasInsurer) {
    return {
      ok: false,
      error:
        "Selecteer een verzekeraar voordat je polisvoorwaarden zoekt. Bij Onbekend is online zoeken niet mogelijk.",
    };
  }

  if (!value.insuranceType) {
    return {
      ok: false,
      error: "Selecteer een soort verzekering voordat je zoekt.",
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value.damageDate)) {
    return {
      ok: false,
      error: "Vul een geldige schadedatum in voordat je zoekt.",
    };
  }

  return { ok: true, value };
}
