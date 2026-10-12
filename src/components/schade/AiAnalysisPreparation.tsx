"use client";

import { useId, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Check,
  ClipboardCopy,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { buildAnalysisPrompt } from "@/lib/ai-analysis/build-analysis-prompt";
import {
  MAX_ANALYSIS_PROMPT_CHARS,
  type AiAnalysisDocumentInput,
  type AiAnalysisPromptInput,
} from "@/lib/ai-analysis/types";
import { INSURANCE_TYPE_OPTIONS } from "@/lib/insurance-options";
import {
  POLICY_DOCUMENT_TYPE_OPTIONS,
  type PolicySearchInput,
} from "@/lib/policy-types";
import type { LocalPolicyUploadDocument } from "./PolicyDocumentUpload";
import type {
  AdditionalQuestion,
  QuestionAnswer,
} from "./AdditionalQuestions";

type AiAnalysisPreparationProps = {
  policySearchInput: PolicySearchInput;
  damageDescription: string;
  questions: AdditionalQuestion[];
  questionAnswers: Record<string, QuestionAnswer>;
  uploadedDocuments: LocalPolicyUploadDocument[];
};

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

function resolveInsuranceTypeLabel(value: string): string {
  return (
    INSURANCE_TYPE_OPTIONS.find((option) => option.value === value)?.label ??
    value
  );
}

function resolveDocumentTypeLabel(value: string): string {
  return (
    POLICY_DOCUMENT_TYPE_OPTIONS.find((option) => option.value === value)
      ?.label ?? value
  );
}

function toAnalysisDocuments(
  documents: LocalPolicyUploadDocument[],
  selectedIds: Set<string>,
): AiAnalysisDocumentInput[] {
  return documents
    .filter(
      (doc) =>
        selectedIds.has(doc.id) &&
        doc.extractionStatus === "ready" &&
        doc.extractedDocument &&
        doc.extractedDocument.totalTextLength > 0,
    )
    .map((doc) => ({
      id: doc.id,
      fileName: doc.file.name,
      documentType: doc.documentType,
      documentTypeLabel: resolveDocumentTypeLabel(doc.documentType),
      pageCount: doc.extractedDocument!.pageCount,
      pages: doc.extractedDocument!.pages.map((page) => ({
        pageNumber: page.pageNumber,
        text: page.text,
      })),
      totalTextLength: doc.extractedDocument!.totalTextLength,
    }));
}

export function AiAnalysisPreparation({
  policySearchInput,
  damageDescription,
  questions,
  questionAnswers,
  uploadedDocuments,
}: AiAnalysisPreparationProps) {
  const privacyId = useId();
  const readableDocuments = useMemo(
    () =>
      uploadedDocuments.filter(
        (doc) =>
          doc.extractionStatus === "ready" &&
          doc.extractedDocument &&
          doc.extractedDocument.totalTextLength > 0,
      ),
    [uploadedDocuments],
  );

  /** null = standaard alle leesbare documenten; array = expliciete keuze. */
  const [selectedIds, setSelectedIds] = useState<string[] | null>(null);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [copyStatus, setCopyStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const [copyError, setCopyError] = useState<string | null>(null);

  const effectiveSelectedIds = useMemo(() => {
    const availableIds = readableDocuments.map((doc) => doc.id);
    if (selectedIds === null) return availableIds;
    const available = new Set(availableIds);
    return selectedIds.filter((id) => available.has(id));
  }, [readableDocuments, selectedIds]);

  const selectedIdSet = useMemo(
    () => new Set(effectiveSelectedIds),
    [effectiveSelectedIds],
  );

  const answeredQuestions = questions
    .map((question) => {
      const answer = (questionAnswers[question.id] ?? "").trim();
      if (!answer) return null;
      const displayAnswer =
        question.type === "yes_no_unknown"
          ? answer === "ja"
            ? "Ja"
            : answer === "nee"
              ? "Nee"
              : answer === "onbekend"
                ? "Onbekend"
                : answer
          : answer;
      return {
        questionId: question.id,
        prompt: question.prompt,
        answer: displayAnswer,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const promptInput: AiAnalysisPromptInput = {
    insurerValue: policySearchInput.insurerValue,
    insurerLabel: policySearchInput.insurerLabel,
    insurerOtherName: policySearchInput.insurerOtherName,
    insuranceType: policySearchInput.insuranceType,
    insuranceTypeLabel: resolveInsuranceTypeLabel(
      policySearchInput.insuranceType,
    ),
    damageDate: policySearchInput.damageDate,
    policyConditionCode: policySearchInput.policyConditionCode,
    coverageVariant: policySearchInput.coverageVariant,
    damageDescription,
    answeredQuestions,
    documents: toAnalysisDocuments(uploadedDocuments, selectedIdSet),
  };

  const buildResult = buildAnalysisPrompt(promptInput);
  const canCopy =
    privacyConfirmed && buildResult.ok && buildResult.prompt.length > 0;

  function toggleDocument(id: string) {
    setCopyStatus("idle");
    setCopyError(null);
    setSelectedIds((current) => {
      const available = new Set(readableDocuments.map((doc) => doc.id));
      const base =
        current === null
          ? readableDocuments.map((doc) => doc.id)
          : current.filter((item) => available.has(item));

      if (base.includes(id)) {
        return base.filter((item) => item !== id);
      }
      return [...base, id];
    });
  }

  async function handleCopy() {
    setCopyStatus("idle");
    setCopyError(null);

    if (!privacyConfirmed) {
      setCopyError("Bevestig eerst de privacycontrole.");
      setCopyStatus("failed");
      return;
    }

    if (!buildResult.ok) {
      setCopyError(buildResult.errors[0] ?? "De analyseopdracht is niet compleet.");
      setCopyStatus("failed");
      return;
    }

    try {
      await navigator.clipboard.writeText(buildResult.prompt);
      setCopyStatus("copied");
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = buildResult.prompt;
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

  return (
    <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef6f2] text-dba-dark-green">
          <Bot className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-dba-charcoal">
            AI-schadeanalyse voorbereiden
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-dba-muted">
            Maak een gestructureerde analyseopdracht op basis van de
            schadeomschrijving en de beschikbare polisvoorwaarden.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-dba-border bg-dba-background/50 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-dba-muted">
          Voor deze versie worden uitsluitend lokaal uitgelezen PDF-teksten
          gebruikt. Online gevonden documentlinks zijn geen ingelezen
          documenten: download die eerst en upload ze hierboven.
        </p>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-dba-charcoal">
          Documenten voor analyse
        </h3>
        {readableDocuments.length === 0 ? (
          <p className="mt-2 text-sm leading-relaxed text-dba-muted">
            Nog geen leesbare PDF-tekst beschikbaar. Upload polisvoorwaarden en
            wacht tot de tekstextractie is afgerond.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {readableDocuments.map((doc) => {
              const checked = selectedIdSet.has(doc.id);
              return (
                <li key={doc.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-dba-border bg-white px-3 py-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleDocument(doc.id)}
                      className="mt-1 h-4 w-4 rounded border-dba-border text-dba-dark-green focus:ring-dba-green"
                    />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-medium text-dba-charcoal">
                        <FileText
                          className="h-4 w-4 shrink-0 text-dba-dark-green"
                          strokeWidth={1.75}
                        />
                        <span className="truncate">{doc.file.name}</span>
                      </span>
                      <span className="mt-1 block text-[12px] text-dba-muted">
                        {resolveDocumentTypeLabel(doc.documentType)}
                        {doc.extractedDocument
                          ? ` · ${doc.extractedDocument.pageCount} pagina${
                              doc.extractedDocument.pageCount === 1 ? "" : "s"
                            }`
                          : ""}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-dba-border bg-dba-background/40 px-3 py-3">
          <dt className="text-[12px] text-dba-muted">Geselecteerde documenten</dt>
          <dd className="mt-1 text-sm font-semibold text-dba-charcoal">
            {buildResult.documentCount}
          </dd>
        </div>
        <div className="rounded-lg border border-dba-border bg-dba-background/40 px-3 py-3">
          <dt className="text-[12px] text-dba-muted">Totaal pagina&apos;s</dt>
          <dd className="mt-1 text-sm font-semibold text-dba-charcoal">
            {buildResult.pageCount}
          </dd>
        </div>
        <div className="rounded-lg border border-dba-border bg-dba-background/40 px-3 py-3">
          <dt className="text-[12px] text-dba-muted">Geschatte lengte opdracht</dt>
          <dd className="mt-1 text-sm font-semibold text-dba-charcoal">
            {buildResult.characterCount.toLocaleString("nl-NL")} /{" "}
            {MAX_ANALYSIS_PROMPT_CHARS.toLocaleString("nl-NL")} tekens
          </dd>
        </div>
      </dl>

      {!buildResult.ok && buildResult.errors.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[#f0d0d0] bg-[#fdf5f5] px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0 text-[#9b2c2c]"
              strokeWidth={1.75}
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-[#9b2c2c]">
                Ontbrekende of onvolledige invoer
              </p>
              <ul className="list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-[#9b2c2c]">
                {buildResult.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      {buildResult.warnings.length > 0 ? (
        <div className="mt-4 rounded-lg border border-[#e8d9b5] bg-[#fffaf0] px-4 py-3">
          <ul className="list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-dba-charcoal">
            {buildResult.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 rounded-lg border border-dba-border bg-[#eef6f2]/70 px-4 py-4">
        <div className="flex gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-dba-dark-green"
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Privacycontrole vóór kopiëren
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
              Controleer of de schadeomschrijving en polisdocumenten geen
              persoonsgegevens of andere vertrouwelijke gegevens bevatten die
              niet in de gekozen AI-omgeving verwerkt mogen worden.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-dba-muted">
              De volledige geselecteerde documenttekst wordt onderdeel van de te
              kopiëren analyseopdracht. Er wordt niets vanuit DBA naar een
              AI-dienst verzonden; jij plakt de opdracht zelf in ChatGPT of
              Copilot.
            </p>
          </div>
        </div>

        <label
          htmlFor={privacyId}
          className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-dba-border bg-white px-3 py-3"
        >
          <input
            id={privacyId}
            type="checkbox"
            checked={privacyConfirmed}
            onChange={(event) => {
              setPrivacyConfirmed(event.target.checked);
              setCopyStatus("idle");
              setCopyError(null);
            }}
            className="mt-0.5 h-4 w-4 rounded border-dba-border text-dba-dark-green focus:ring-dba-green"
          />
          <span className="text-sm leading-relaxed text-dba-charcoal">
            Ik heb gecontroleerd dat de te kopiëren gegevens geen onnodige
            persoonsgegevens of andere vertrouwelijke informatie bevatten voor
            de gekozen AI-omgeving.
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          disabled={!canCopy}
          className={`${primaryButtonClass} shrink-0`}
        >
          <ClipboardCopy className="h-4 w-4" strokeWidth={1.75} />
          Kopieer opdracht voor AI
        </button>

        {copyStatus === "copied" ? (
          <p className="inline-flex items-center gap-1.5 text-sm text-dba-dark-green">
            <Check className="h-4 w-4" strokeWidth={1.75} />
            Analyseopdracht gekopieerd. Plak deze in ChatGPT of Copilot.
          </p>
        ) : null}
      </div>

      {copyStatus === "failed" && copyError ? (
        <p role="alert" className="mt-3 text-sm leading-relaxed text-[#9b2c2c]">
          {copyError}
        </p>
      ) : null}
    </section>
  );
}
