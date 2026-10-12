"use client";

import { Shield } from "lucide-react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import type { PolicySearchInput } from "@/lib/policy-types";
import { InsurerCombobox } from "./InsurerCombobox";

const fieldClass =
  "h-10 w-full rounded-lg border border-dba-border bg-dba-background px-3 text-sm text-dba-charcoal outline-none focus-visible:border-dba-green focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

const labelClass = "mb-1.5 block text-[13px] font-medium text-dba-charcoal";

const helperClass = "mt-1.5 text-[12px] leading-relaxed text-dba-muted";

type InsuranceDetailsFormProps = {
  value: PolicySearchInput;
  onChange: (value: PolicySearchInput) => void;
};

export function InsuranceDetailsForm({
  value,
  onChange,
}: InsuranceDetailsFormProps) {
  function patch(partial: Partial<PolicySearchInput>) {
    onChange({ ...value, ...partial });
  }

  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="mb-5 flex items-start gap-3 rounded-lg border border-dba-border bg-dba-background/60 px-4 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dba-pill-bg text-dba-pill-text">
          <Shield className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <p className="pt-1.5 text-[13px] leading-relaxed text-dba-muted">
          Vul geen namen, adressen, polisnummers of andere persoonsgegevens in.
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-base font-semibold text-dba-charcoal">
          Verzekeringsgegevens
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
          Selecteer de verzekering en vul de beschikbare polisgegevens in.
        </p>
      </div>

      <form className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="insurer" className={labelClass}>
            Verzekeraar *
          </label>
          <InsurerCombobox
            id="insurer"
            name="insurer"
            required
            value={value.insurerValue}
            otherName={value.insurerOtherName}
            onSelect={(option) =>
              patch({
                insurerValue: option?.value ?? "",
                insurerLabel: option?.label ?? "",
                insurerOtherName:
                  option?.value === "anders" ? value.insurerOtherName : "",
              })
            }
            onOtherNameChange={(insurerOtherName) =>
              patch({ insurerOtherName })
            }
          />
        </div>

        <div>
          <label htmlFor="insuranceType" className={labelClass}>
            Soort verzekering *
          </label>
          <select
            id="insuranceType"
            name="insuranceType"
            required
            value={value.insuranceType}
            onChange={(event) => patch({ insuranceType: event.target.value })}
            className={fieldClass}
          >
            <option value="" disabled>
              Selecteer soort verzekering
            </option>
            {INSURANCE_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="damageDate" className={labelClass}>
            Schadedatum *
          </label>
          <input
            id="damageDate"
            name="damageDate"
            type="date"
            required
            value={value.damageDate}
            onChange={(event) => patch({ damageDate: event.target.value })}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="policyConditionCode" className={labelClass}>
            Polisvoorwaardencode
          </label>
          <input
            id="policyConditionCode"
            name="policyConditionCode"
            type="text"
            autoComplete="off"
            placeholder="Bijvoorbeeld: voorwaardencode van het polisblad"
            value={value.policyConditionCode}
            onChange={(event) =>
              patch({ policyConditionCode: event.target.value })
            }
            className={fieldClass}
          />
          <p className={helperClass}>
            De voorwaardecode helpt om de juiste versie van de
            polisvoorwaarden te vinden.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="coverageVariant" className={labelClass}>
            Dekking / variant
          </label>
          <input
            id="coverageVariant"
            name="coverageVariant"
            type="text"
            autoComplete="off"
            placeholder="Bijvoorbeeld: WA, WA+ of allrisk"
            value={value.coverageVariant}
            onChange={(event) =>
              patch({ coverageVariant: event.target.value })
            }
            className={fieldClass}
          />
          <p className={helperClass}>
            Vul dit in als de dekking of variant bekend is.
          </p>
        </div>
      </form>
    </section>
  );
}
