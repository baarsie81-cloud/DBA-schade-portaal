"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, LoaderCircle, Search, Upload } from "lucide-react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import {
  DEMO_POLICY_DOCUMENT,
  type PolicyDocument,
  type PolicySearchInput,
  type PolicySearchStatus,
} from "@/lib/policy-types";

type PolicySearchProps = {
  searchInput: PolicySearchInput;
};

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-4 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2";

const demoChipClass =
  "inline-flex h-8 items-center rounded-lg border px-3 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

function displayOrFallback(value: string): string {
  const trimmed = value.trim();
  return trimmed || "Nog niet ingevuld";
}

function resolveInsurerDisplay(input: PolicySearchInput): string {
  if (input.insurerValue === "anders") {
    return displayOrFallback(input.insurerOtherName || "Anders");
  }
  if (input.insurerValue === "onbekend") return "Onbekend";
  return displayOrFallback(input.insurerLabel);
}

function resolveInsuranceTypeLabel(value: string): string {
  const match = INSURANCE_TYPE_OPTIONS.find((option) => option.value === value);
  return match?.label ?? displayOrFallback(value);
}

function formatDateNl(value: string): string {
  if (!value) return "Nog niet ingevuld";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}-${month}-${year}`;
}

const STATUS_OPTIONS: { status: PolicySearchStatus; label: string }[] = [
  { status: "idle", label: "Nog niet gezocht" },
  { status: "searching", label: "Zoeken" },
  { status: "exact_match", label: "Exacte match" },
  { status: "no_match", label: "Geen match" },
];

export function PolicySearch({ searchInput }: PolicySearchProps) {
  const [status, setStatus] = useState<PolicySearchStatus>("idle");
  const [document, setDocument] = useState<PolicyDocument | null>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current != null) {
        window.clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  function clearPendingSearch() {
    if (searchTimeoutRef.current != null) {
      window.clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }

  function applyDemoStatus(next: PolicySearchStatus) {
    clearPendingSearch();
    setStatus(next);
    setDocument(next === "exact_match" ? DEMO_POLICY_DOCUMENT : null);
  }

  function handleSearchClick() {
    clearPendingSearch();
    setStatus("searching");
    setDocument(null);
    searchTimeoutRef.current = window.setTimeout(() => {
      setStatus("exact_match");
      setDocument(DEMO_POLICY_DOCUMENT);
      searchTimeoutRef.current = null;
    }, 1200);
  }

  const summaryItems = [
    { label: "Verzekeraar", value: resolveInsurerDisplay(searchInput) },
    {
      label: "Soort verzekering",
      value: resolveInsuranceTypeLabel(searchInput.insuranceType),
    },
    {
      label: "Schadedatum",
      value: formatDateNl(searchInput.damageDate),
    },
    {
      label: "Polisvoorwaardencode",
      value: displayOrFallback(searchInput.policyConditionCode),
      optional: true,
    },
    {
      label: "Dekking / variant",
      value: displayOrFallback(searchInput.coverageVariant),
      optional: true,
    },
  ];

  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-dba-charcoal">
            Polisvoorwaarden controleren
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
            Zoek de juiste polisvoorwaarden op basis van de ingevulde
            verzekeringsgegevens.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSearchClick}
          disabled={status === "searching"}
          className={`${primaryButtonClass} shrink-0`}
        >
          <Search className="h-4 w-4" strokeWidth={1.75} />
          Polisvoorwaarden zoeken
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-dba-border bg-dba-background/60 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dba-muted">
          Zoekgegevens uit formulier
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaryItems.map((item) => (
            <div key={item.label}>
              <dt className="text-[12px] text-dba-muted">{item.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-5 rounded-lg border border-dashed border-dba-border-strong bg-dba-background/40 px-4 py-3">
        <p className="text-[12.5px] font-medium text-dba-charcoal">
          Frontend-demonstratie
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-dba-muted">
          Er wordt nog niet echt online gezocht. Wissel hieronder tussen de
          vier documentstatussen om de interface te beoordelen.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.status;
            return (
              <button
                key={option.status}
                type="button"
                onClick={() => applyDemoStatus(option.status)}
                className={`${demoChipClass} ${
                  active
                    ? "border-dba-green bg-[#eef6f2] text-dba-dark-green"
                    : "border-dba-border bg-white text-dba-muted hover:text-dba-charcoal"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-dba-border px-4 py-4">
        {status === "idle" ? (
          <p className="text-sm leading-relaxed text-dba-muted">
            Start een zoekopdracht om de toepasselijke polisvoorwaarden te
            vinden.
          </p>
        ) : null}

        {status === "searching" ? (
          <div className="flex items-center gap-3 text-sm text-dba-charcoal">
            <LoaderCircle
              className="h-4 w-4 shrink-0 animate-spin text-dba-green"
              strokeWidth={1.75}
              aria-hidden
            />
            <p>Polisvoorwaarden worden opgezocht...</p>
          </div>
        ) : null}

        {status === "exact_match" && document ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-dba-muted">
              De polisvoorwaarden zijn geïdentificeerd. Controleer of deze
              overeenkomen met het polisblad.
            </p>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[12px] text-dba-muted">Naam verzekeraar</dt>
                <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                  {document.insurerName}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-dba-muted">Soort verzekering</dt>
                <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                  {document.insuranceTypeLabel}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[12px] text-dba-muted">Documenttitel</dt>
                <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                  {document.documentTitle}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-dba-muted">Voorwaardecode</dt>
                <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                  {document.conditionCode}
                </dd>
              </div>
              <div>
                <dt className="text-[12px] text-dba-muted">
                  Versie / documentdatum
                </dt>
                <dd className="mt-0.5 text-sm font-medium text-dba-charcoal">
                  {document.versionLabel}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[12px] text-dba-muted">Officiële bronlink</dt>
                <dd className="mt-1">
                  <a
                    href={document.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-dba-dark-green hover:text-dba-green"
                  >
                    {document.sourceLabel}
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        ) : null}

        {status === "no_match" ? (
          <div className="space-y-4">
            <p className="text-sm leading-relaxed text-dba-muted">
              De juiste polisvoorwaarden konden niet met voldoende zekerheid
              worden vastgesteld.
            </p>
            <button type="button" className={secondaryButtonClass}>
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Polisdocumenten uploaden
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
