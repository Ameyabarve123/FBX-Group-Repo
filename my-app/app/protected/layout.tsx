import { Suspense } from "react";
import NavbarWithUser from "@/components/dashboardComponents/navbar-with-user";

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
      <Suspense fallback={<div className="h-14 border-b border-white/[0.06] bg-[#080710]" />}>
        <NavbarWithUser />
      </Suspense>

      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  );
}