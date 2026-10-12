import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { NieuweSchadeWorkspace } from "@/components/schade/NieuweSchadeWorkspace";

export default function NieuweSchadePage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="SCHADEBEOORDELING"
        title="Nieuwe schade"
        subtitle="Vul de verzekeringsgegevens in om een schadebeoordeling te starten."
      />
      <NieuweSchadeWorkspace />
    </div>
  );
}
