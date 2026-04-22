"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, ExternalLink, Plus, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar, SectionCard, TableHeader, LoadingRow, EmptyRow,
  getInitials, PAGE_BG,
} from "../components";

import EnterprisePlanModal   from "@/components/dashboardComponents/enterprisePlanModal";
import CreateEnterpriseModal from "@/components/dashboardComponents/createEnterpriseModal";
import CredentialsModal      from "@/components/dashboardComponents/credentialsModal";
import type { DBUser, DBPlan } from "@/components/dashboardComponents/types";

export default function EnterprisesPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [dbUsers,        setDbUsers]        = useState<DBUser[]>([]);
  const [dbPlans,        setDbPlans]        = useState<DBPlan[]>([]);
  const [studentCounts,  setStudentCounts]  = useState<Record<string, number>>({});
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);

  const [selectedEnterprise,   setSelectedEnterprise]   = useState<DBUser | null>(null);
  const [createEnterpriseOpen, setCreateEnterpriseOpen] = useState(false);
  const [newCredentials,       setNewCredentials]       = useState<{ name: string; email: string; password: string } | null>(null);

  const enterprises = dbUsers.filter((u) => u.role === 3);

  function getPlanForUser(userUuid: string): DBPlan | undefined {
    return dbPlans.find((p) => p.user_uuid === userUuid);
  }

  async function fetchStudentCounts(users: DBUser[]) {
    const enterpriseUsers = users.filter((u) => u.role === 3);
    if (enterpriseUsers.length === 0) return;

    const counts: Record<string, number> = {};

    await Promise.all(
      enterpriseUsers.map(async (u) => {
        const { count, error } = await supabase
          .from("enterprise_students")
          .select("*", { count: "exact", head: true })
          .eq("enterprise_uuid", u.user_uuid);
        console.log(`enterprise ${u.client_name} (${u.user_uuid}): count=${count}, error=${error?.message}`);
        counts[u.user_uuid] = count ?? 0;
      })
    );

    console.log("final counts:", counts);
    setStudentCounts(counts);
  }

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data: adminCheck, error: adminErr } = await supabase
        .from("users").select("is_admin").eq("user_uuid", user.id).single();
      if (adminErr || !adminCheck || adminCheck.is_admin !== 1) {
        setError("Access denied"); setLoading(false); return;
      }

      try {
        const [usersRes, plansRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("plans").select("*"),
        ]);
        if (usersRes.error) throw new Error(usersRes.error.message);
        if (plansRes.error) throw new Error(plansRes.error.message);
        const users = usersRes.data ?? [];
        setDbUsers(users);
        setDbPlans(plansRes.data ?? []);
        await fetchStudentCounts(users);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleSavePlan(updated: Partial<DBPlan>) {
    if (!selectedEnterprise) return;
    const existing = getPlanForUser(selectedEnterprise.user_uuid);
    const payload  = { ...updated, user_uuid: selectedEnterprise.user_uuid };

    const { data, error } = await supabase
      .from("plans")
      .upsert(payload, { onConflict: "user_uuid" })
      .select()
      .single();

    if (error) { console.error("Failed to save plan:", error.message); return; }
    if (!data) return;

    setDbPlans((prev) =>
      existing
        ? prev.map((p) => p.user_uuid === selectedEnterprise.user_uuid ? data : p)
        : [...prev, data],
    );
  }

  async function handleEnterpriseCreated(name: string, email: string, password: string) {
    setNewCredentials({ name, email, password });
    const [usersRes, plansRes] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("plans").select("*"),
    ]);
    const users = usersRes.data ?? [];
    if (!usersRes.error) setDbUsers(users);
    if (!plansRes.error) setDbPlans(plansRes.data ?? []);
    await fetchStudentCounts(users);
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#FF6996] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/100 text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>

      {selectedEnterprise && (
        <EnterprisePlanModal
          enterprise={selectedEnterprise}
          plan={getPlanForUser(selectedEnterprise.user_uuid)}
          studentCount={studentCounts[selectedEnterprise.user_uuid] ?? 0}
          onClose={() => setSelectedEnterprise(null)}
          onSave={handleSavePlan}
        />
      )}
      {createEnterpriseOpen && (
        <CreateEnterpriseModal
          onClose={() => setCreateEnterpriseOpen(false)}
          onCreated={handleEnterpriseCreated}
        />
      )}
      {newCredentials && (
        <CredentialsModal
          name={newCredentials.name}
          email={newCredentials.email}
          password={newCredentials.password}
          onClose={() => setNewCredentials(null)}
        />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125]">
        <button
          onClick={() => router.push("/protected/adminDashboard")}
          className="flex items-center gap-1.5 text-white/100 hover:text-white/100 text-[10px] font-bold uppercase tracking-[0.18em] mb-3 transition"
        >
          <ArrowLeft size={11} />Back
        </button>
        <p className="text-xs uppercase tracking-[0.22em] text-white/100 mb-1">FBX Technologies</p>
        <h1 className="text-white/100 text-2xl font-bold tracking-wide">Enterprise Accounts</h1>
      </div>

      <SectionCard title="Enterprise Accounts" icon={Building2} count={enterprises.length} accent="teal">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <button
            onClick={() => setCreateEnterpriseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8AC7F4]/10 border border-[#8AC7F4]/20 text-[#8AC7F4] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#8AC7F4]/15 transition"
          >
            <Plus size={12} />New Enterprise
          </button>
        </div>

        <TableHeader cols={["Profile", "Company", "Price", "Robots", "Students"]} />

        {loading
          ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
          : enterprises.length === 0
          ? <EmptyRow message="No enterprise accounts" />
          : enterprises.map((u) => {
              const plan         = getPlanForUser(u.user_uuid);
              const shipped      = plan?.robots_shipped       ?? 0;
              const total        = plan?.robots_allocated     ?? 0;
              const curriculums  = plan?.curriculums_allocated ?? 0;
              const students     = studentCounts[u.user_uuid] ?? 0;
              const pct          = total > 0 ? Math.min(100, Math.round((shipped / total) * 100)) : 0;
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedEnterprise(u)}
                  className="px-5 py-4 grid sm:grid-cols-5 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
                >
                  <Avatar initials={getInitials(u.client_name)} color="teal" />
                  <span className="text-white/100 text-sm truncate">{u.client_name}</span>
                  <span className="text-sm text-white/100">
                    {plan ? `$${plan.price.toLocaleString()}` : <span className="text-white/100">—</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {total > 0 ? (
                      <>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-[#8AC7F4] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-white/100 tabular-nums flex-shrink-0">{shipped}/{total}</span>
                      </>
                    ) : (
                      <span className="text-sm text-white/100">—</span>
                    )}
                  </div>
                  {/* Students column */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/100 tabular-nums">
                      {students > 0
                        ? <><span className="text-[#FF6996]">{students}</span>{curriculums > 0 && <span className="text-white/100"> /{curriculums}</span>}</>
                        : <span className="text-white/100">—</span>
                      }
                    </span>
                    <ExternalLink size={11} className="text-[#8AC7F4] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
      </SectionCard>
    </div>
  );
}