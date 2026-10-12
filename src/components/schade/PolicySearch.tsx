"use client";

import { useState } from "react";
import { ExternalLink, LoaderCircle, Search, Upload } from "lucide-react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import type {
  PolicyCandidate,
  PolicySearchInput,
  PolicySearchStatus,
} from "@/lib/policy-types";

type PolicySearchProps = {
  searchInput: PolicySearchInput;
};

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-4 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2";

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

export function PolicySearch({ searchInput }: PolicySearchProps) {
  const [status, setStatus] = useState<PolicySearchStatus>("idle");
  const [candidates, setCandidates] = useState<PolicyCandidate[]>([]);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearchClick() {
    setStatus("searching");
    setError(null);
    setInfoMessage(null);
    setCandidates([]);

    try {
      const response = await fetch("/api/poliszoeken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(searchInput),
      });

      const data = (await response.json()) as {
        status?:
          | "not_implemented"
          | "candidates_found"
          | "no_match"
          | "setup_pending";
        candidates?: PolicyCandidate[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setError(
          data.error ??
            "Er ging iets mis bij het zoeken. Probeer het opnieuw.",
        );
        return;
      }

      if (data.status === "not_implemented" || data.status === "setup_pending") {
        setCandidates([]);
        setInfoMessage(
          data.message ??
            "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
        );
        setStatus("not_implemented");
        return;
      }

      if (data.status === "candidates_found" && data.candidates?.length) {
        setCandidates(data.candidates);
        setInfoMessage(
          data.message ??
            "Controleer of het gevonden document overeenkomt met de voorwaarden op het polisblad.",
        );
        setStatus("candidates_found");
        return;
      }

      setCandidates([]);
      setInfoMessage(
        data.message ??
          "De juiste polisvoorwaarden konden niet met voldoende zekerheid worden vastgesteld.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
      );
      setStatus("no_match");
    } catch {
      setStatus("error");
      setError(
        "De zoekopdracht kon niet worden uitgevoerd. Controleer je verbinding en probeer het opnieuw.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze.",
      );
    }
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
    },
    {
      label: "Dekking / variant",
      value: displayOrFallback(searchInput.coverageVariant),
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

        {status === "not_implemented" ? (
          <div className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-dba-muted">
              {infoMessage ??
                "Automatisch zoeken voor deze verzekeraar is nog niet beschikbaar.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze."}
            </p>
            <button type="button" className={secondaryButtonClass}>
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Polisdocumenten uploaden
            </button>
          </div>
        ) : null}

        {status === "candidates_found" ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-dba-charcoal">
                Mogelijke polisvoorwaarden gevonden
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
                {infoMessage ??
                  "Controleer of het gevonden document overeenkomt met de voorwaarden op het polisblad."}
              </p>
            </div>

            <ul className="space-y-3">
              {candidates.map((candidate) => (
                <li
                  key={candidate.url}
                  className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-start gap-1.5 text-sm font-semibold text-dba-dark-green hover:text-dba-green"
                      >
                        <span>{candidate.title}</span>
                        <ExternalLink
                          className="mt-0.5 h-3.5 w-3.5 shrink-0"
                          strokeWidth={1.75}
                        />
                      </a>
                      <p className="mt-1 text-[12px] text-dba-muted">
                        Herkomst: {candidate.domain}
                      </p>
                      {candidate.conditionCodeHint ? (
                        <p className="mt-1 text-[12px] text-dba-muted">
                          Herkende voorwaardecode:{" "}
                          <span className="font-medium text-dba-charcoal">
                            {candidate.conditionCodeHint}
                          </span>
                        </p>
                      ) : null}
                    </div>
                    <span className="inline-flex rounded-full bg-[#eef6f2] px-2.5 py-1 text-[11px] font-medium text-dba-dark-green">
                      Mogelijke officiële bron
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status === "no_match" ? (
          <div className="space-y-4">
            <p className="whitespace-pre-line text-sm leading-relaxed text-dba-muted">
              {infoMessage ??
                "De juiste polisvoorwaarden konden niet met voldoende zekerheid worden vastgesteld.\n\nZoek de juiste polisvoorwaarden in het interne systeem van DBA en upload deze."}
            </p>
            <button type="button" className={secondaryButtonClass}>
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Polisdocumenten uploaden
            </button>
          </div>
        ) : null}

        {status === "error" && error ? (
          <div className="space-y-4">
            <p
              role="alert"
              className="whitespace-pre-line text-sm leading-relaxed text-dba-muted"
            >
              {error}
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
