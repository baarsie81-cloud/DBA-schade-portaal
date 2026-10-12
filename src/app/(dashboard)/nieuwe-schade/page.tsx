import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InsuranceDetailsForm } from "@/components/schade/InsuranceDetailsForm";

export default function NieuweSchadePage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        eyebrow="SCHADEBEOORDELING"
        title="Nieuwe schade"
        subtitle="Vul de verzekeringsgegevens in om een schadebeoordeling te starten."
      />
      <InsuranceDetailsForm />
    </div>
  );
}
