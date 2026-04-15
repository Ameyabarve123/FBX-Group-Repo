import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getDashboardPathForUser } from "@/lib/dashboard-routing";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const claims = data.claims as { sub?: string };
  if (!claims.sub) {
    redirect("/auth/login");
  }

  const { data: dbUser } = await supabase
    .from("users")
    .select("is_admin, role")
    .eq("user_uuid", claims.sub)
    .maybeSingle();

  redirect(getDashboardPathForUser(dbUser ?? { is_admin: 0 }));
}
