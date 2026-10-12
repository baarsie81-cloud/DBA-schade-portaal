"use client";

import { useId, useRef, useState } from "react";
import { FileText, ShieldCheck, Trash2, Upload } from "lucide-react";
import {
  POLICY_DOCUMENT_TYPE_OPTIONS,
  type PolicyDocumentType,
} from "@/lib/policy-types";

export const MAX_POLICY_DOCUMENTS = 5;
export const MAX_POLICY_DOCUMENT_BYTES = 15 * 1024 * 1024;

export type LocalPolicyUploadDocument = {
  id: string;
  file: File;
  documentType: PolicyDocumentType;
};

type PolicyDocumentUploadProps = {
  documents: LocalPolicyUploadDocument[];
  onChange: (documents: LocalPolicyUploadDocument[]) => void;
};

const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-4 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function createDocumentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `doc-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function hasPdfSignature(file: File): Promise<boolean> {
  try {
    const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
    // %PDF-
    return (
      header.length >= 5 &&
      header[0] === 0x25 &&
      header[1] === 0x50 &&
      header[2] === 0x44 &&
      header[3] === 0x46 &&
      header[4] === 0x2d
    );
  } catch {
    return false;
  }
}

function isAllowedPdfMime(mimeType: string): boolean {
  const normalized = mimeType.trim().toLowerCase();
  // Sommige browsers geven een leeg of generiek type; handtekening dekt dat af.
  return (
    normalized === "" ||
    normalized === "application/pdf" ||
    normalized === "application/x-pdf" ||
    normalized === "application/octet-stream"
  );
}

async function validatePdfFile(
  file: File,
  currentCount: number,
): Promise<string | null> {
  if (currentCount >= MAX_POLICY_DOCUMENTS) {
    return `Je kunt maximaal ${MAX_POLICY_DOCUMENTS} documenten selecteren.`;
  }

  const lowerName = file.name.toLowerCase();
  if (!lowerName.endsWith(".pdf")) {
    return `"${file.name}" is geen PDF-bestand. Selecteer alleen bestanden met de extensie .pdf.`;
  }

  if (!isAllowedPdfMime(file.type)) {
    return `"${file.name}" heeft een ongeldig bestandstype. Alleen PDF-bestanden (application/pdf) zijn toegestaan.`;
  }

  if (file.size <= 0) {
    return `"${file.name}" is leeg en kan niet worden toegevoegd.`;
  }

  if (file.size > MAX_POLICY_DOCUMENT_BYTES) {
    return `"${file.name}" is groter dan 15 MB. Verklein het bestand of kies een ander PDF-document.`;
  }

  const looksLikePdf = await hasPdfSignature(file);
  if (!looksLikePdf) {
    return `"${file.name}" lijkt geen geldig PDF-bestand te zijn. Controleer het bestand en probeer het opnieuw.`;
  }

  return null;
}

export function PolicyDocumentUpload({
  documents,
  onChange,
}: PolicyDocumentUploadProps) {
  const inputId = useId();
  const checkboxId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const next = [...documents];
    const rejected: string[] = [];

    for (const file of Array.from(fileList)) {
      const validationError = await validatePdfFile(file, next.length);
      if (validationError) {
        rejected.push(validationError);
        continue;
      }

      const duplicate = next.some(
        (doc) =>
          doc.file.name === file.name &&
          doc.file.size === file.size &&
          doc.file.lastModified === file.lastModified,
      );
      if (duplicate) {
        rejected.push(`"${file.name}" staat al in de selectie.`);
        continue;
      }

      next.push({
        id: createDocumentId(),
        file,
        documentType: "polisvoorwaarden",
      });
    }

    if (next.length !== documents.length) {
      onChange(next);
    }

    if (rejected.length > 0) {
      setError(rejected[0] ?? null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateDocumentType(id: string, documentType: PolicyDocumentType) {
    onChange(
      documents.map((doc) =>
        doc.id === id ? { ...doc, documentType } : doc,
      ),
    );
  }

  function removeDocument(id: string) {
    onChange(documents.filter((doc) => doc.id !== id));
    setError(null);
  }

  const remainingSlots = MAX_POLICY_DOCUMENTS - documents.length;
  const selectionDisabled = !privacyConfirmed || remainingSlots <= 0;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-dba-border bg-[#eef6f2]/70 px-4 py-4">
        <div className="flex gap-3">
          <ShieldCheck
            className="mt-0.5 h-5 w-5 shrink-0 text-dba-dark-green"
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-dba-charcoal">
              Controleer het document op persoonsgegevens
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
              Verwijder vóór het uploaden namen, adressen, geboortedata,
              contactgegevens, polisnummers en andere herleidbare
              persoonsgegevens die niet noodzakelijk zijn voor de beoordeling.
            </p>
            <p className="mt-2 text-[13px] leading-relaxed text-dba-muted">
              Let ook op verborgen PDF-tekst en metadata.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-dba-muted">
              Deze bevestiging is geen garantie dat een document volledig
              geanonimiseerd is.
            </p>
          </div>
        </div>

        <label
          htmlFor={checkboxId}
          className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-dba-border bg-white px-3 py-3"
        >
          <input
            id={checkboxId}
            type="checkbox"
            checked={privacyConfirmed}
            onChange={(event) => {
              setPrivacyConfirmed(event.target.checked);
              setError(null);
            }}
            className="mt-0.5 h-4 w-4 rounded border-dba-border text-dba-dark-green focus:ring-dba-green"
          />
          <span className="text-sm leading-relaxed text-dba-charcoal">
            Ik heb gecontroleerd dat de documenten geen onnodige
            persoonsgegevens bevatten.
          </span>
        </label>
      </div>

      <div className="rounded-lg border border-dashed border-dba-border bg-dba-background/40 px-4 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-dba-charcoal">
              PDF-documenten selecteren
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-dba-muted">
              Alleen PDF, maximaal 15 MB per bestand, maximaal{" "}
              {MAX_POLICY_DOCUMENTS} documenten. Een polisblad is niet hetzelfde
              als de polisvoorwaarden; een polisblad alleen kan onvoldoende zijn
              voor de latere schadeanalyse.
            </p>
          </div>
          <button
            type="button"
            disabled={selectionDisabled}
            onClick={() => fileInputRef.current?.click()}
            className={`${secondaryButtonClass} shrink-0`}
          >
            <Upload className="h-4 w-4" strokeWidth={1.75} />
            PDF toevoegen
          </button>
        </div>

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={selectionDisabled}
          className="sr-only"
          onChange={(event) => {
            void handleFilesSelected(event.target.files);
          }}
        />

        {!privacyConfirmed ? (
          <p className="mt-3 text-[12px] text-dba-muted">
            Vink eerst de privacycontrole aan om bestanden te kunnen selecteren.
          </p>
        ) : null}

        {privacyConfirmed && remainingSlots <= 0 ? (
          <p className="mt-3 text-[12px] text-dba-muted">
            Je hebt het maximum van {MAX_POLICY_DOCUMENTS} documenten bereikt.
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm leading-relaxed text-[#9b2c2c]">
          {error}
        </p>
      ) : null}

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-semibold text-dba-charcoal">
            Geselecteerde documenten
          </h3>
          <p className="text-[12px] text-dba-muted">
            {documents.length} van {MAX_POLICY_DOCUMENTS}
          </p>
        </div>

        {documents.length === 0 ? (
          <p className="mt-3 text-sm leading-relaxed text-dba-muted">
            Nog geen documenten geselecteerd. Bestanden blijven alleen tijdelijk
            in deze browsersessie; er wordt nog niets naar een server gestuurd.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg border border-dba-border bg-dba-background/40 px-4 py-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <FileText
                      className="mt-0.5 h-4 w-4 shrink-0 text-dba-dark-green"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-dba-charcoal">
                        {doc.file.name}
                      </p>
                      <p className="mt-1 text-[12px] text-dba-muted">
                        {formatFileSize(doc.file.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="sr-only" htmlFor={`doc-type-${doc.id}`}>
                      Documenttype voor {doc.file.name}
                    </label>
                    <select
                      id={`doc-type-${doc.id}`}
                      value={doc.documentType}
                      onChange={(event) =>
                        updateDocumentType(
                          doc.id,
                          event.target.value as PolicyDocumentType,
                        )
                      }
                      className="h-10 min-w-[14rem] rounded-lg border border-dba-border bg-white px-3 text-sm text-dba-charcoal focus:outline-none focus:ring-2 focus:ring-dba-green"
                    >
                      {POLICY_DOCUMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-dba-border bg-white px-3 text-sm font-medium text-dba-charcoal transition-colors hover:bg-dba-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-green focus-visible:ring-offset-2"
                      aria-label={`${doc.file.name} verwijderen`}
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                      Verwijderen
                    </button>
                  </div>
                </div>
                {doc.documentType === "polisblad" ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-dba-muted">
                    Let op: een polisblad is niet hetzelfde als de
                    polisvoorwaarden. Voeg indien mogelijk ook de
                    polisvoorwaarden toe.
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
