import { MobileHeader } from "@/components/dashboard/MobileHeader";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-dba-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="flex-1 overflow-x-auto px-6 py-7 xl:px-8">
          <div className="w-full max-w-none">{children}</div>
        </main>
      </div>
    </div>
  );
}
