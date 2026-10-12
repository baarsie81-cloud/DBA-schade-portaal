"use client";

import { useState, type ReactNode } from "react";
import {
  ExternalLink,
  LoaderCircle,
  Search,
  Upload,
} from "lucide-react";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import type {
  PolicyCandidate,
  PolicySearchInput,
  PolicySearchStatus,
} from "@/lib/policy-types";
import {
  PolicyDocumentUpload,
  type LocalPolicyUploadDocument,
} from "./PolicyDocumentUpload";

type DocumentsUpdater =
  | LocalPolicyUploadDocument[]
  | ((prev: LocalPolicyUploadDocument[]) => LocalPolicyUploadDocument[]);

type PolicySearchProps = {
  searchInput: PolicySearchInput;
  uploadedDocuments: LocalPolicyUploadDocument[];
  onUploadedDocumentsChange: (next: DocumentsUpdater) => void;
};

type DocumentRoute = "search" | "upload";

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-4 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2";

const DEFAULT_MANUAL_MESSAGE =
  "De juiste polisvoorwaarden konden niet automatisch worden vastgesteld.\n\nZoek de toepasselijke voorwaarden in het interne systeem van DBA en upload deze handmatig.";

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

function SwitchToUploadButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={secondaryButtonClass}>
      <Upload className="h-4 w-4" strokeWidth={1.75} />
      Polisdocumenten uploaden
    </button>
  );
}

function CandidateList({ candidates }: { candidates: PolicyCandidate[] }) {
  return (
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
              {candidate.insurerName ? (
                <p className="mt-1 text-[12px] text-dba-muted">
                  Verzekeringsmerk:{" "}
                  <span className="font-medium text-dba-charcoal">
                    {candidate.insurerName}
                  </span>
                </p>
              ) : null}
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
  );
}

function RouteCard({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2 ${
        active
          ? "border-dba-dark-green bg-[#eef6f2]"
          : "border-dba-border bg-white hover:bg-dba-background/60"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            active
              ? "bg-dba-dark-green text-white"
              : "bg-dba-background text-dba-dark-green"
          }`}
        >
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-dba-charcoal">
            {title}
          </span>
          <span className="mt-1 block text-[13px] leading-relaxed text-dba-muted">
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

export function PolicySearch({
  searchInput,
  uploadedDocuments,
  onUploadedDocumentsChange,
}: PolicySearchProps) {
  const [route, setRoute] = useState<DocumentRoute>("search");
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
          | "manual_only"
          | "limited"
          | "candidates_found"
          | "no_match"
          | "setup_pending";
        candidates?: PolicyCandidate[];
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setStatus("error");
        setError(data.error ?? DEFAULT_MANUAL_MESSAGE);
        return;
      }

      if (
        data.status === "not_implemented" ||
        data.status === "setup_pending" ||
        data.status === "manual_only"
      ) {
        setCandidates([]);
        setInfoMessage(data.message ?? DEFAULT_MANUAL_MESSAGE);
        setStatus(
          data.status === "manual_only" ? "manual_only" : "not_implemented",
        );
        return;
      }

      if (data.status === "limited") {
        setCandidates(data.candidates ?? []);
        setInfoMessage(data.message ?? DEFAULT_MANUAL_MESSAGE);
        setStatus("limited");
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
      setInfoMessage(data.message ?? DEFAULT_MANUAL_MESSAGE);
      setStatus("no_match");
    } catch {
      setStatus("error");
      setError(DEFAULT_MANUAL_MESSAGE);
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
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-dba-charcoal">
          Polisdocumenten aanleveren
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
          Kies zelf of je polisvoorwaarden online zoekt of documenten
          rechtstreeks uploadt. Online zoeken is niet verplicht.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <RouteCard
          active={route === "search"}
          title="Online zoeken"
          description="Zoek openbare kandidaatdocumenten op officiële verzekeraarsbronnen."
          icon={<Search className="h-4 w-4" strokeWidth={1.75} />}
          onClick={() => setRoute("search")}
        />
        <RouteCard
          active={route === "upload"}
          title="Documenten uploaden"
          description="Selecteer PDF-documenten uit het DBA-systeem of een andere lokale bron."
          icon={<Upload className="h-4 w-4" strokeWidth={1.75} />}
          onClick={() => setRoute("upload")}
        />
      </div>

      {route === "search" ? (
        <>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-dba-charcoal">
                Online polisvoorwaarden zoeken
              </h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
                Zoek op basis van de ingevulde verzekeringsgegevens. Gevonden
                documenten zijn kandidaten, geen automatische match.
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
                vinden, of wissel naar documenten uploaden.
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

            {status === "not_implemented" || status === "manual_only" ? (
              <div className="space-y-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-dba-muted">
                  {infoMessage ?? DEFAULT_MANUAL_MESSAGE}
                </p>
                <div className="rounded-lg border border-dba-border bg-dba-background/50 px-4 py-3">
                  <p className="text-sm font-medium text-dba-charcoal">
                    Geen passende polisvoorwaarden gevonden?
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                    Upload de juiste documenten uit het DBA-systeem.
                  </p>
                </div>
                <SwitchToUploadButton onClick={() => setRoute("upload")} />
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
                <CandidateList candidates={candidates} />
                <p className="text-[13px] leading-relaxed text-dba-muted">
                  Twijfel je over de gevonden documenten? Upload desgewenst de
                  juiste PDF&apos;s uit het DBA-systeem.
                </p>
                <SwitchToUploadButton onClick={() => setRoute("upload")} />
              </div>
            ) : null}

            {status === "limited" ? (
              <div className="space-y-4">
                {candidates.length > 0 ? (
                  <>
                    <div>
                      <p className="text-sm font-semibold text-dba-charcoal">
                        Mogelijke polisvoorwaarden gevonden
                      </p>
                      <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-dba-muted">
                        {infoMessage ?? DEFAULT_MANUAL_MESSAGE}
                      </p>
                    </div>
                    <CandidateList candidates={candidates} />
                  </>
                ) : (
                  <p className="whitespace-pre-line text-sm leading-relaxed text-dba-muted">
                    {infoMessage ?? DEFAULT_MANUAL_MESSAGE}
                  </p>
                )}
                <div className="rounded-lg border border-dba-border bg-dba-background/50 px-4 py-3">
                  <p className="text-sm font-medium text-dba-charcoal">
                    Geen passende polisvoorwaarden gevonden?
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                    Upload de juiste documenten uit het DBA-systeem.
                  </p>
                </div>
                <SwitchToUploadButton onClick={() => setRoute("upload")} />
              </div>
            ) : null}

            {status === "no_match" ? (
              <div className="space-y-4">
                <p className="whitespace-pre-line text-sm leading-relaxed text-dba-muted">
                  {infoMessage ?? DEFAULT_MANUAL_MESSAGE}
                </p>
                <div className="rounded-lg border border-dba-border bg-dba-background/50 px-4 py-3">
                  <p className="text-sm font-medium text-dba-charcoal">
                    Geen passende polisvoorwaarden gevonden?
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                    Upload de juiste documenten uit het DBA-systeem.
                  </p>
                </div>
                <SwitchToUploadButton onClick={() => setRoute("upload")} />
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
                <div className="rounded-lg border border-dba-border bg-dba-background/50 px-4 py-3">
                  <p className="text-sm font-medium text-dba-charcoal">
                    Geen passende polisvoorwaarden gevonden?
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                    Upload de juiste documenten uit het DBA-systeem.
                  </p>
                </div>
                <SwitchToUploadButton onClick={() => setRoute("upload")} />
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Documenten uploaden
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
              Selecteer lokale PDF-bestanden. Tekstextractie gebeurt alleen in
              de browser; er wordt niets naar een server gestuurd. Er volgt nog
              geen polisverificatie.
            </p>
          </div>
          <PolicyDocumentUpload
            documents={uploadedDocuments}
            onChange={onUploadedDocumentsChange}
          />
          {uploadedDocuments.length > 0 ? (
            <p className="text-[12px] leading-relaxed text-dba-muted">
              {uploadedDocuments.length} document
              {uploadedDocuments.length === 1 ? "" : "en"} tijdelijk
              geselecteerd. Je kunt op ieder moment terug naar online zoeken;
              de selectie blijft behouden op deze pagina.
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}
