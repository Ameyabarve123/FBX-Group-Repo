// app/clientDashboard/layout.tsx
import TeacherNavbar from "@/components/dashboardComponents/teacherNavbar";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080710]">
      <TeacherNavbar activePage="dashboard" />
      <main>
        {children}
      </main>
    </div>
  );
}