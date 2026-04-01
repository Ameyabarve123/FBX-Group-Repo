import { Suspense } from "react";
import Navbar from "@/components/dashboardComponents/navbar";
import { createClient } from "@/lib/supabase/server";

async function NavbarWithUser() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: dbUser } = user
    ? await supabase.from("users").select("client_name, is_admin").eq("user_uuid", user.id).single()
    : { data: null };

  return (
    <Navbar
      activePage="dashboard"
      isAdmin={dbUser?.is_admin === 1}
      clientName={dbUser?.client_name ?? undefined}
    />
  );
}

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