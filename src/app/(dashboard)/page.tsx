import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="DBA ADVIES"
        title="Schade-assistent"
        subtitle="Ondersteuning bij schadebeoordelingen en klantcommunicatie."
      />

      <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)]">
        <h2 className="text-base font-semibold text-dba-charcoal">
          Welkom bij de DBA Schade-assistent
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-dba-muted">
          Start een nieuwe schadebeoordeling of bekijk eerdere analyses.
        </p>
        <div className="mt-5">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-dba-dark-green px-4 text-sm font-medium text-white transition-colors hover:bg-dba-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dba-dark-green focus-visible:ring-offset-2"
          >
            Nieuwe schade
          </button>
        </div>
      </section>
    </div>
  );
}
