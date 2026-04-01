// app/clientDashboard/layout.tsx
import ClientNavbar from "@/components/dashboardComponents/clientNavbar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080710]">
      {/* <ClientNavbar activePage="dashboard" /> */}
      <main>
        {children}
      </main>
    </div>
  );
}