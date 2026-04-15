"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DbUser {
  client_name?: string;
  is_admin?: number;
  role?: number;
}

const FUNBOTICS_DOCS_URL = "https://funbotics.gitbook.io/funbotics-docs";

export default function StudentDashboard() {
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const supabase = createClient();
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data: row, error: dbError } = await supabase
        .from("users")
        .select("client_name, is_admin, role")
        .eq("user_uuid", user.id)
        .maybeSingle<DbUser>();

      if (dbError) {
        setError(dbError.message);
        setLoading(false);
        return;
      }

      if (Number(row?.is_admin) === 1 || Number(row?.role) === 0) {
        setError("Access denied");
        setLoading(false);
        return;
      }

      setDbUser(row ?? null);
      setLoading(false);
    }

    checkAccess();
  }, []);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080710]">
        <div className="text-center space-y-1">
          <p className="text-[#e8629a] text-xs uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/30 text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto bg-[#080710] min-h-screen">
      <div className="pb-4 border-b border-white/[0.06]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/20 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-light tracking-wide">
          {loading ? "Portal" : `Welcome, ${dbUser?.client_name ?? "Student"}`}
        </h1>
      </div>

      {!loading && (
        <a
          href={FUNBOTICS_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#9b7fe8]/20 bg-[#9b7fe8]/10 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition"
        >
          Open Funbotics Docs
        </a>
      )}
    </div>
  );
}
