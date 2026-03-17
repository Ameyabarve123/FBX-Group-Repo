import Navbar from "@/components/dashboardComponents/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-[#12111d] text-[#e8e0ee]"
      style={{ fontFamily: "'DM Sans', 'Outfit', sans-serif" }}
    >
      {/* Sidebar + top bar (both fixed/absolute, managed internally) */}
      <Navbar activePage="dashboard" />

      {/* 
        pt-14 clears the fixed top bar.
        The sidebar is a fixed overlay on all sizes — it slides over content
        rather than pushing it, which avoids needing shared state between
        the layout and the navbar component.
      */}
      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  );
}