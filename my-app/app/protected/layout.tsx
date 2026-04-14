import { Suspense } from "react";
import { Montserrat } from "next/font/google";
import NavbarWithUser from "@/components/dashboardComponents/navbar-with-user";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${montserrat.variable} min-h-screen bg-[#12111d] text-[#e8e0ee]`}
      style={{ fontFamily: "var(--font-montserrat), Arial, sans-serif" }}
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