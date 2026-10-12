import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SchadeoverzichtPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Schadeoverzicht"
        subtitle="Hier komt later het overzicht van eerdere analyses."
      />
      <section className="rounded-xl border border-dba-border bg-dba-surface px-6 py-6 shadow-[0_1px_2px_rgba(51,53,54,0.03)]">
        <p className="text-sm text-dba-muted">
          Deze pagina is nog in voorbereiding.
        </p>
      </section>
    </div>
  );
}
