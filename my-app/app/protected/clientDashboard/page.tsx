"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  TicketCheck,
  FileText,
  UserPlus,
  ArrowRight,
  Users,
  GraduationCap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBUser, DBPlan, DBOrder, DBTicket } from "@/components/dashboardComponents/types";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #0f262e 87%, #42696a 100%)',
};

// ─── ACCENTS ─────────────────────────────────────────────────────────────────
const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" },
  blue:   { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10", border: "border-[#629fcc]/20" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" },
  teal:   { text: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/20" },
};
type AccentKey = keyof typeof ACCENTS;

// ─── CLICKABLE STAT CARD ─────────────────────────────────────────────────────
function ClickableStatCard({
  label,
  value,
  accent,
  onClick,
}: {
  label: string;
  value: string;
  accent: AccentKey;
  onClick: () => void;
}) {
  const a = ACCENTS[accent];
  
  return (
    <button
      onClick={onClick}
      className={`group relative rounded-xl bg-[#0d0b1e] border ${a.border} p-5 overflow-hidden hover:border-opacity-60 hover:bg-white/[0.02] transition-all duration-200 text-left w-full cursor-pointer`}
    >
      <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/100 font-bold mb-3">{label}</p>
      <div className="flex items-center justify-between">
        <p className={`text-4xl font-light ${a.text} tabular-nums`}>{value}</p>
        <ArrowRight size={16} className={`${a.text} opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0`} />
      </div>
    </button>
  );
}

// ─── NAV TILE ────────────────────────────────────────────────────────────────
function NavTile({
  href,
  icon: Icon,
  label,
  count,
  accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  count: number;
  accent: AccentKey;
}) {
  const router = useRouter();
  const a = ACCENTS[accent];
  
  return (
    <button
      onClick={() => router.push(href)}
      className={`group relative flex flex-col gap-4 p-5 rounded-xl bg-[#0d0b1e] border ${a.border} hover:border-opacity-60 transition-all duration-200 text-left w-full overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg ${a.bg} flex items-center justify-center`}>
          <Icon size={16} className={a.text} />
        </div>
        <span className={`text-2xl font-bold tabular-nums ${a.text}`}>
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/100 text-xs font-bold uppercase tracking-[0.18em]">{label}</span>
        <ArrowRight size={13} className={`${a.text} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200`} />
      </div>
    </button>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [dbPlan, setDbPlan] = useState<DBPlan | null>(null);
  const [dbOrders, setDbOrders] = useState<DBOrder[]>([]);
  const [openTickets, setOpenTickets] = useState<DBTicket[]>([]);
  const [teacherCount, setTeacherCount] = useState<number>(0);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      try {
        const [userRes, planRes, ordersRes, openRes, teachersRes, studentsRes] = await Promise.all([
          supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
          supabase.from("plans").select("*").eq("user_uuid", user.id).maybeSingle(),
          supabase.from("orders").select("*").eq("user_uuid", user.id),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 0),
          supabase.from("enterprise_teachers").select("*", { count: "exact", head: true }).eq("enterprise_uuid", user.id),
          supabase.from("enterprise_students").select("*", { count: "exact", head: true }).eq("enterprise_uuid", user.id),
        ]);

        if (userRes.error) throw new Error(`User: ${userRes.error.message}`);
        if (ordersRes.error) throw new Error(`Orders: ${ordersRes.error.message}`);
        if (openRes.error) throw new Error(`Tickets: ${openRes.error.message}`);

        setDbUser(userRes.data ?? null);
        setDbPlan(planRes.data ?? null);
        setDbOrders(ordersRes.data ?? []);
        setOpenTickets(openRes.data ?? []);
        setTeacherCount(teachersRes.count ?? 0);
        setStudentCount(studentsRes.count ?? 0);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [supabase]);

  const handleStatClick = (destination: string) => {
    router.push(destination);
  };

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/100 text-base">{error}</p>
        </div>
      </div>
    );
  }

  const shipped = dbPlan?.robots_shipped ?? 0;
  const allocated = dbPlan?.robots_allocated ?? 0;
  const totalStudentSeats = dbPlan?.curriculums_allocated ?? 0;

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>
      
      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <img src="/fbx_logo.png" alt="FBX Logo" className="max-h-[7vh] max-w-full" />
          <div>
            <h1 className="text-white/100 text-2xl font-bold tracking-wide">Client Dashboard</h1>
          </div>
        </div>
        <p className="text-white/100 text-sm font-light tracking-wide">
          {loading ? "Loading portal…" : `${dbUser?.client_name ?? "Enterprise"}'s Portal`}
        </p>
      </div>

      {/* Clickable Stat Cards */}
      <div className="grid grid-cols-4 gap-3">
        <ClickableStatCard
          label="Robots Shipped"
          value={loading ? "—" : `${shipped} / ${allocated}`}
          accent="teal"
          onClick={() => handleStatClick("/protected/clientDashboard/contract")}
        />
        <ClickableStatCard
          label="Active Orders"
          value={loading ? "—" : String(dbOrders.length).padStart(2, "0")}
          accent="blue"
          onClick={() => handleStatClick("/protected/clientDashboard/orders")}
        />
        <ClickableStatCard
          label="Open Tickets"
          value={loading ? "—" : String(openTickets.length).padStart(2, "0")}
          accent="pink"
          onClick={() => handleStatClick("/protected/clientDashboard/tickets")}
        />
        <ClickableStatCard
          label="Students Enrolled"
          value={loading ? "—" : `${studentCount} / ${totalStudentSeats}`}
          accent="slate"
          onClick={() => handleStatClick("/protected/clientDashboard/teachers")}
        />
      </div>

      {/* Navigation Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <NavTile
          href="/protected/clientDashboard/orders"
          icon={Package}
          label="Orders & Tracking"
          count={loading ? 0 : dbOrders.length}
          accent="blue"
        />
        <NavTile
          href="/protected/clientDashboard/tickets"
          icon={TicketCheck}
          label="Support Tickets"
          count={loading ? 0 : openTickets.length}
          accent="pink"
        />
        <NavTile
          href="/protected/clientDashboard/contract"
          icon={FileText}
          label="Contract Details"
          count={dbPlan ? 1 : 0}
          accent="teal"
        />
        <NavTile
          href="/protected/clientDashboard/teachers"
          icon={Users}
          label="Teachers & Students"
          count={teacherCount + studentCount}
          accent="slate"
        />
      </div>

      {/* Quick Actions */}
      <div className="pt-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/100">Quick Actions</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => router.push("/protected/clientDashboard/teachers?action=createTeacher")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition"
          >
            <UserPlus size={12} />Create Teacher
          </button>
          <button
            onClick={() => router.push("/protected/clientDashboard/tickets?action=new")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c975b9]/10 border border-[#c975b9]/25 text-[#c975b9] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#c975b9]/15 transition"
          >
            <TicketCheck size={12} />Open Ticket
          </button>
          <button
            onClick={() => router.push("/protected/clientDashboard/teachers")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#91bee3]/15 transition"
          >
            <GraduationCap size={12} />Manage Students
          </button>
        </div>
      </div>
    </div>
  );
}