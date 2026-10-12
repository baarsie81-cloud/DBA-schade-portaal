"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ClipboardCopy,
  FileSearch,
  Mail,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";
import {
  AI_COVERAGE_ASSESSMENT_LABELS,
  parseAnalysisResult,
} from "@/lib/ai-analysis/parse-analysis-result";
import type { AiAnalysisResult as AiAnalysisResultData } from "@/lib/ai-analysis/types";
import {
  SOURCE_VERIFICATION_STATUS_LABELS,
  verifyAnalysisSources,
  type SourceVerificationResult,
  type SourceVerificationStatus,
  type VerifiableDocument,
} from "@/lib/ai-analysis/verify-sources";
import type { LocalPolicyUploadDocument } from "./PolicyDocumentUpload";

type AiAnalysisResultProps = {
  uploadedDocuments: LocalPolicyUploadDocument[];
};

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-4 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const textareaClass =
  "min-h-[220px] w-full resize-y rounded-lg border border-dba-border bg-dba-background px-3 py-2.5 text-sm leading-relaxed text-dba-charcoal outline-none placeholder:text-dba-muted focus-visible:border-dba-green focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-1";

function toVerifiableDocuments(
  documents: LocalPolicyUploadDocument[],
): VerifiableDocument[] {
  return documents
    .filter(
      (doc) =>
        doc.extractionStatus === "ready" &&
        doc.extractedDocument &&
        doc.extractedDocument.pages.length > 0,
    )
    .map((doc) => ({
      id: doc.id,
      fileName: doc.file.name,
      pages: doc.extractedDocument!.pages.map((page) => ({
        pageNumber: page.pageNumber,
        text: page.text,
      })),
    }));
}

function ArgumentList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <div className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-4">
      <h3 className="text-sm font-semibold text-dba-charcoal">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px] leading-relaxed text-dba-muted">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-dba-charcoal">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function verificationBadgeClass(status: SourceVerificationStatus): string {
  switch (status) {
    case "verified":
      return "bg-[#eef6f2] text-dba-dark-green";
    case "partially_verified":
      return "bg-[#fff6e8] text-[#8a5a00]";
    case "unverified":
      return "bg-[#fdf5f5] text-[#9b2c2c]";
  }
}

function VerificationStatusIcon({
  status,
}: {
  status: SourceVerificationStatus;
}) {
  if (status === "verified") {
    return (
      <CheckCircle2
        className="h-3.5 w-3.5 shrink-0"
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  if (status === "partially_verified") {
    return (
      <ShieldQuestion
        className="h-3.5 w-3.5 shrink-0"
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  return (
    <AlertTriangle
      className="h-3.5 w-3.5 shrink-0"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function SourceVerificationCard({
  item,
}: {
  item: SourceVerificationResult;
}) {
  return (
    <li className="rounded-lg border border-dba-border bg-white px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-dba-charcoal">
            {item.source.documentnaam}
          </p>
          <p className="mt-1 text-[12px] text-dba-muted">
            Pagina {item.source.paginanummer}
            {item.source.artikel ? ` · ${item.source.artikel}` : ""}
            {item.matchedFileName
              ? ` · Bestand: ${item.matchedFileName}`
              : ""}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${verificationBadgeClass(
            item.status,
          )}`}
        >
          <VerificationStatusIcon status={item.status} />
          {SOURCE_VERIFICATION_STATUS_LABELS[item.status]}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-dba-charcoal">
        {item.source.relevante_passage}
      </p>
      <p className="mt-2 text-[12px] leading-relaxed text-dba-muted">
        {item.explanation}
      </p>
    </li>
  );
}

export function AiAnalysisResult({
  uploadedDocuments,
}: AiAnalysisResultProps) {
  const reviewCheckboxId = useId();
  const sourcesReviewCheckboxId = useId();
  const [rawAnswer, setRawAnswer] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [processedResult, setProcessedResult] =
    useState<AiAnalysisResultData | null>(null);
  const [processedFromRaw, setProcessedFromRaw] = useState<string | null>(null);
  const [editableMail, setEditableMail] = useState("");
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [incompleteSourcesAcknowledged, setIncompleteSourcesAcknowledged] =
    useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const [copyError, setCopyError] = useState<string | null>(null);

  const verifiableDocuments = useMemo(
    () => toVerifiableDocuments(uploadedDocuments),
    [uploadedDocuments],
  );

  const verification = useMemo(() => {
    if (!processedResult) return null;
    return verifyAnalysisSources(processedResult, verifiableDocuments);
  }, [processedResult, verifiableDocuments]);

  const rawIsStale =
    processedResult !== null &&
    processedFromRaw !== null &&
    rawAnswer.trim() !== processedFromRaw.trim();

  useEffect(() => {
    if (rawIsStale) {
      setReviewConfirmed(false);
      setIncompleteSourcesAcknowledged(false);
      setCopyStatus("idle");
      setCopyError(null);
    }
  }, [rawIsStale]);

  // Wanneer documenten wijzigen, moet eerdere goedkeuring opnieuw.
  useEffect(() => {
    setReviewConfirmed(false);
    setIncompleteSourcesAcknowledged(false);
    setCopyStatus("idle");
    setCopyError(null);
  }, [uploadedDocuments]);

  function handleProcess() {
    setParseError(null);
    setCopyStatus("idle");
    setCopyError(null);

    const parsed = parseAnalysisResult(rawAnswer);
    if (!parsed.ok) {
      setParseError(parsed.error);
      return;
    }

    setProcessedResult(parsed.value);
    setProcessedFromRaw(rawAnswer);
    setEditableMail(parsed.value.conceptmail);
    setReviewConfirmed(false);
    setIncompleteSourcesAcknowledged(false);
  }

  function handleClear() {
    setRawAnswer("");
    setParseError(null);
    setCopyStatus("idle");
    setCopyError(null);
  }

  async function handleCopyMail() {
    setCopyStatus("idle");
    setCopyError(null);

    if (!reviewConfirmed) {
      setCopyStatus("failed");
      setCopyError(
        "Bevestig eerst dat je de analyse en conceptmail hebt gecontroleerd.",
      );
      return;
    }

    if (verification?.hasIncompleteSources && !incompleteSourcesAcknowledged) {
      setCopyStatus("failed");
      setCopyError(
        "Bevestig eerst dat je de niet volledig geverifieerde bronnen hebt beoordeeld.",
      );
      return;
    }

    const text = editableMail.trim();
    if (!text) {
      setCopyStatus("failed");
      setCopyError("De conceptmail is leeg.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!ok) throw new Error("copy failed");
        setCopyStatus("copied");
      } catch {
        setCopyStatus("failed");
        setCopyError(
          "Kopiëren naar het klembord is mislukt. Controleer de browserrechten of kopieer handmatig.",
        );
      }
    }
  }

  const canCopyMail =
    reviewConfirmed &&
    Boolean(editableMail.trim()) &&
    (!verification?.hasIncompleteSources || incompleteSourcesAcknowledged);

  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-dba-charcoal">
          AI-schadeanalyse
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
          Plak hieronder het volledige antwoord uit ChatGPT of Copilot om de
          voorlopige schadebeoordeling te bekijken.
        </p>
      </div>

      <div className="mt-5">
        <label
          htmlFor="ai-analysis-paste"
          className="mb-1.5 block text-[13px] font-medium text-dba-charcoal"
        >
          AI-analyse plakken
        </label>
        <textarea
          id="ai-analysis-paste"
          value={rawAnswer}
          onChange={(event) => {
            setRawAnswer(event.target.value);
            setParseError(null);
            setCopyStatus("idle");
            setCopyError(null);
          }}
          rows={12}
          placeholder="Plak hier het volledige JSON-antwoord uit ChatGPT of Copilot."
          className={textareaClass}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleProcess}
          className={primaryButtonClass}
        >
          <FileSearch className="h-4 w-4" strokeWidth={1.75} />
          Analyse verwerken
        </button>
        <button
          type="button"
          onClick={handleClear}
          className={secondaryButtonClass}
          disabled={!rawAnswer}
        >
          Tekst wissen
        </button>
      </div>

      {parseError ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-[#f0d0d0] bg-[#fdf5f5] px-4 py-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#9b2c2c]"
              strokeWidth={1.75}
            />
            <p className="text-sm leading-relaxed text-[#9b2c2c]">{parseError}</p>
          </div>
        </div>
      ) : null}

      {rawIsStale ? (
        <div className="mt-4 rounded-lg border border-[#e8d9b5] bg-[#fffaf0] px-4 py-3">
          <p className="text-[13px] leading-relaxed text-dba-charcoal">
            Het geplakte antwoord is gewijzigd sinds de laatste verwerking. De
            getoonde analyse kan verouderd zijn. Verwerk het antwoord opnieuw
            om de resultaten bij te werken.
          </p>
        </div>
      ) : null}

      {processedResult && verification ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-dba-border bg-[#eef6f2]/70 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dba-muted">
              Voorlopige beoordeling
            </p>
            <p className="mt-2 text-lg font-semibold text-dba-dark-green">
              {AI_COVERAGE_ASSESSMENT_LABELS[processedResult.beoordeling]}
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-dba-border bg-white px-3 py-2.5">
              <ShieldAlert
                className="mt-0.5 h-4 w-4 shrink-0 text-dba-dark-green"
                strokeWidth={1.75}
              />
              <p className="text-[13px] leading-relaxed text-dba-muted">
                Dit is een voorlopige AI-beoordeling. Een DBA-medewerker moet de
                inhoud en polisvoorwaarden controleren.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-4">
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Samenvatting
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-dba-charcoal">
              {processedResult.samenvatting}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ArgumentList
              title="Argumenten voor dekking"
              items={processedResult.argumenten_voor}
              emptyLabel="Geen argumenten voor dekking genoemd."
            />
            <ArgumentList
              title="Argumenten tegen dekking"
              items={processedResult.argumenten_tegen}
              emptyLabel="Geen argumenten tegen dekking genoemd."
            />
          </div>

          <div className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-4">
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Ontbrekende informatie
            </h3>
            {processedResult.ontbrekende_informatie.length === 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-dba-muted">
                Geen aanvullende informatie genoemd.
              </p>
            ) : (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] leading-relaxed text-dba-charcoal">
                {processedResult.ontbrekende_informatie.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-4">
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Bronverwijzingen
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
              Broncontrole bevestigt uitsluitend of de genoemde tekst en
              artikelen terug te vinden zijn in de documenten. De inhoudelijke
              dekkingsbeoordeling moet door een medewerker worden gecontroleerd.
            </p>
            <p className="mt-2 text-[12px] text-dba-muted">
              {verification.verifiedCount} geverifieerd ·{" "}
              {verification.partiallyVerifiedCount} gedeeltelijk ·{" "}
              {verification.unverifiedCount} niet geverifieerd
              {verifiableDocuments.length === 0
                ? " · Geen leesbare PDF-tekst beschikbaar voor controle"
                : ""}
            </p>

            {verification.results.length === 0 ? (
              <p className="mt-3 text-[13px] leading-relaxed text-dba-muted">
                Geen bronnen genoemd.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {verification.results.map((item, index) => (
                  <SourceVerificationCard
                    key={`${item.source.documentnaam}-${item.source.paginanummer}-${index}`}
                    item={item}
                  />
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-dba-border bg-white px-4 py-4 sm:px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef6f2] text-dba-dark-green">
                <Mail className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-dba-charcoal">
                  Conceptmail voor de klant
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                  Dit is een concept. Pas de tekst aan waar nodig. Er wordt
                  niets automatisch verzonden.
                </p>
              </div>
            </div>

            {verification.hasIncompleteSources ? (
              <div className="mt-4 rounded-lg border border-[#e8d9b5] bg-[#fffaf0] px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-[#8a5a00]"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-dba-charcoal">
                      Niet alle bronverwijzingen zijn volledig geverifieerd
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
                      Controleer of onbevestigde of gedeeltelijk bevestigde
                      bronnen niet ongemerkt in de klantmail terechtkomen.
                    </p>
                    <label
                      htmlFor={sourcesReviewCheckboxId}
                      className="mt-3 flex cursor-pointer items-start gap-3 rounded-lg border border-dba-border bg-white px-3 py-3"
                    >
                      <input
                        id={sourcesReviewCheckboxId}
                        type="checkbox"
                        checked={incompleteSourcesAcknowledged}
                        onChange={(event) => {
                          setIncompleteSourcesAcknowledged(
                            event.target.checked,
                          );
                          setCopyStatus("idle");
                          setCopyError(null);
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-dba-border text-dba-dark-green focus:ring-dba-green"
                      />
                      <span className="text-sm leading-relaxed text-dba-charcoal">
                        Ik heb de niet volledig geverifieerde bronnen expliciet
                        beoordeeld voor gebruik in de conceptmail.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            <label
              htmlFor="ai-concept-mail"
              className="mt-4 mb-1.5 block text-[13px] font-medium text-dba-charcoal"
            >
              Conceptmail
            </label>
            <textarea
              id="ai-concept-mail"
              value={editableMail}
              onChange={(event) => {
                setEditableMail(event.target.value);
                setCopyStatus("idle");
                setCopyError(null);
              }}
              rows={10}
              className={textareaClass}
            />

            <label
              htmlFor={reviewCheckboxId}
              className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-dba-border bg-dba-background/50 px-3 py-3"
            >
              <input
                id={reviewCheckboxId}
                type="checkbox"
                checked={reviewConfirmed}
                onChange={(event) => {
                  setReviewConfirmed(event.target.checked);
                  setCopyStatus("idle");
                  setCopyError(null);
                }}
                className="mt-0.5 h-4 w-4 rounded border-dba-border text-dba-dark-green focus:ring-dba-green"
              />
              <span className="text-sm leading-relaxed text-dba-charcoal">
                Ik heb de voorlopige analyse en conceptmail inhoudelijk
                gecontroleerd.
              </span>
            </label>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  void handleCopyMail();
                }}
                disabled={!canCopyMail}
                className={primaryButtonClass}
              >
                <ClipboardCopy className="h-4 w-4" strokeWidth={1.75} />
                Conceptmail kopiëren
              </button>
              {copyStatus === "copied" ? (
                <p className="inline-flex items-center gap-1.5 text-sm text-dba-dark-green">
                  <Check className="h-4 w-4" strokeWidth={1.75} />
                  Conceptmail gekopieerd.
                </p>
              ) : null}
            </div>

            {copyStatus === "failed" && copyError ? (
              <p
                role="alert"
                className="mt-3 text-sm leading-relaxed text-[#9b2c2c]"
              >
                {copyError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
