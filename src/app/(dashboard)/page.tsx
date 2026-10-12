import Link from "next/link";
import {
  FilePlus2,
  FileSearch,
  FileText,
  Mail,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const workflowSteps = [
  {
    step: "1",
    title: "Schade invoeren",
    description:
      "Selecteer de verzekering en beschrijf of spreek de schade in.",
    icon: FileText,
  },
  {
    step: "2",
    title: "Polis controleren",
    description:
      "De juiste polisvoorwaarden worden opgezocht of handmatig aangeleverd.",
    icon: FileSearch,
  },
  {
    step: "3",
    title: "Dekking beoordelen",
    description:
      "Relevante artikelen en eventuele uitsluitingen worden inzichtelijk gemaakt.",
    icon: ShieldCheck,
  },
  {
    step: "4",
    title: "Conceptmail opstellen",
    description:
      "Ontvang een begrijpelijke conceptreactie die je zelf controleert en kunt kopiëren.",
    icon: Mail,
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardHeader
        eyebrow="DBA ADVIES"
        title="Schade-assistent"
        subtitle="Ondersteuning bij schadebeoordelingen en klantcommunicatie."
      />

      <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-7 shadow-[0_1px_2px_rgba(51,53,54,0.03)] sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef6f2] text-dba-green">
            <FilePlus2 className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight text-dba-charcoal">
              Nieuwe schade beoordelen
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dba-muted">
              Voer een schadeomschrijving in, controleer de polisvoorwaarden en
              ontvang een onderbouwde analyse met een conceptmail.
            </p>
            <div className="mt-5">
              <Link
                href="/nieuwe-schade"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2"
              >
                <FilePlus2 className="h-4 w-4" strokeWidth={2} />
                Nieuwe schade starten
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-dba-charcoal">
          Hoe werkt het?
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.step}
                className="rounded-xl border border-dba-border bg-dba-surface px-4 py-4 shadow-[0_1px_2px_rgba(51,53,54,0.03)]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef6f2] text-dba-green">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-dba-muted">
                      Stap {item.step}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-dba-charcoal">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-dba-border bg-dba-surface px-5 py-4 shadow-[0_1px_2px_rgba(51,53,54,0.03)]">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dba-pill-bg text-dba-pill-text">
            <Shield className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-dba-charcoal">
              Privacy en gegevensbescherming
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-dba-muted">
              Gebruik uitsluitend geanonimiseerde schadeomschrijvingen.
              Controleer vóór het invoeren of uploaden dat persoonsgegevens zijn
              verwijderd.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
