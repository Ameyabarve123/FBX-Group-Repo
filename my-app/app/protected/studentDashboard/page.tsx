"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface DbUser {
  client_name?: string;
  is_admin?: number;
  role?: number;
}

const FUNBOTICS_DOCS_URL = "https://funbotics.gitbook.io/funbotics-docs";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #2e0f12 87%, #b21d3b 100%)',
};

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
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/50 text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen"
      style={PAGE_BG}
    >
      {/* Static page header */}
      <div className="pb-4 border-b border-white/[0.125] flex items-center gap-4">
        <img src="/fbx_logo.png" alt="FBX Logo" className="max-h-[7vh] max-w-full" />
        <div>
          <h1 className="text-white/75 text-2xl font-bold tracking-wide">Student Dashboard</h1>
        </div>
      </div>

      {/* Welcome + docs button */}
      {!loading && (
        <div className="space-y-4 pt-1 text-2xl">
          <p className="text-white/50 text-sm tracking-wide">
            Welcome, <span className="text-white/75 font-semibold">{dbUser?.client_name ?? "Student"}</span>
          </p>
          <a
            href={FUNBOTICS_DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition"
          >
            Open Funbotics Docs
          </a>
        </div>
      )}
    </div>
  );
}