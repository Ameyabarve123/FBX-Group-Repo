"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  UserPlus,
  CheckCircle2,
  Trash2,
  LucideIcon,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const FUNBOTICS_DOCS_URL = "https://funbotics.gitbook.io/funbotics-docs";

// ─── PAGE BG ──────────────────────────────────────────────────────────────────
export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #280f2e 87%, #59426a 100%)',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface DBUser {
  id: string;
  client_name: string;
  user_uuid: string;
  role: number;
}

interface DBStudentCourse {
  id: string;
  student_email: string;
  enterprise_uuid: string;
}

interface DBPlan {
  id: string;
  user_uuid: string;
  curriculums_allocated: number;
}

// ─── ACCENTS ─────────────────────────────────────────────────────────────────

const ACCENTS = {
  violet: { text: "text-[#D6BDF2]", bg: "bg-[#D6BDF2]/10", border: "border-[#D6BDF2]/20" },
  slate:  { text: "text-[#8AC7F4]", bg: "bg-[#8AC7F4]/10", border: "border-[#8AC7F4]/20" },
  pink:   { text: "text-[#FF6996]", bg: "bg-[#FF6996]/10", border: "border-[#FF6996]/20" },
};
type AccentKey = keyof typeof ACCENTS;

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, count, accent = "violet", children }: {
  title: string; icon: LucideIcon; count?: number; accent?: AccentKey; children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={`bg-[#0d0b1e] border ${a.border} rounded-xl overflow-hidden`}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Icon size={15} className={a.text} />
          <h2 className={`text-white text-[10px] uppercase tracking-[0.18em] font-bold`} style={{ fontFamily: "'Montserrat', sans-serif" }}>{title}</h2>
        </div>
        {count !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.bg} ${a.text} tracking-wider`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.04]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}>
      {cols.map((c) => (
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/40 font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.04]">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-5 py-8 text-center text-white/40 text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>{message}</div>;
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 bg-[#D6BDF2]/10 text-[#D6BDF2] ring-1 ring-[#D6BDF2]/25" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      {initials}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.18em] text-white font-bold mb-1.5" style={{ fontFamily: "'Montserrat', sans-serif" }}>{children}</p>;
}

// ─── CAPACITY BANNER ─────────────────────────────────────────────────────────

function CapacityBanner({ current, max }: { current: number; max: number }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  const isFull = max > 0 && current >= max;
  
  if (max === 0) {
    return (
      <div className="bg-[#FF6996]/5 border border-[#FF6996]/20 px-5 py-3 mb-4 rounded-xl">
        <div className="flex items-center gap-2">
          <AlertCircle size={12} className="text-[#FF6996]" />
          <p className="text-[#FF6996] text-[10px] uppercase tracking-[0.18em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>No licenses allocated</p>
        </div>
        <p className="text-white text-xs mt-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>Contact your enterprise administrator to add student capacity.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#0d0b1e] border border-[#D6BDF2]/20 px-5 py-3 mb-4 rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GraduationCap size={12} className="text-[#D6BDF2]" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-white font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Student Capacity For Enterprise</span>
        </div>
        <span className={`text-[10px] font-bold ${isFull ? "text-[#FF6996]" : "text-[#D6BDF2]"}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {current} / {max} used
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-[#FF6996]" : "bg-[#D6BDF2]"}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {isFull && (
        <p className="text-[#FF6996] text-[10px] mt-2 flex items-center gap-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <AlertCircle size={10} /> Capacity reached. Cannot add more students.
        </p>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function TeacherPortal() {
  const supabase = createClient();

  const [dbUser, setDbUser] = useState<DBUser | null>(null);
  const [enrolled, setEnrolled] = useState<DBStudentCourse[]>([]);
  const [enterpriseUuid, setEnterpriseUuid] = useState<string | null>(null);
  const [enterprisePlan, setEnterprisePlan] = useState<DBPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        setError("Not authenticated"); 
        setLoading(false); 
        return; 
      }

      try {
        const [userRes, teacherRes] = await Promise.all([
          supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
          supabase.from("enterprise_teachers").select("enterprise_uuid").eq("client_uuid", user.id).limit(1).maybeSingle(),
        ]);
        
        if (userRes.error) throw new Error(`User: ${userRes.error.message}`);
        if (teacherRes.error) throw new Error(`Enterprise: ${teacherRes.error.message}`);

        const entUuid = teacherRes.data?.enterprise_uuid ?? null;
        setDbUser(userRes.data ?? null);
        setEnterpriseUuid(entUuid);

        if (entUuid) {
          const [planRes, studentsRes] = await Promise.all([
            supabase.from("plans").select("*").eq("user_uuid", entUuid).maybeSingle(),
            supabase.from("enterprise_students").select("*").eq("enterprise_uuid", entUuid),
          ]);
          
          if (planRes.error) throw new Error(`Plan: ${planRes.error.message}`);
          if (studentsRes.error) throw new Error(`Students: ${studentsRes.error.message}`);
          
          setEnterprisePlan(planRes.data ?? null);
          setEnrolled(studentsRes.data ?? []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleAdd() {
    if (!email || !dbUser || !enterpriseUuid) return;
    
    const maxCapacity = enterprisePlan?.curriculums_allocated ?? 0;
    const currentCount = enrolled.length;
    
    if (maxCapacity > 0 && currentCount >= maxCapacity) {
      setFormErr(`Cannot add student. Maximum capacity of ${maxCapacity} students reached.`);
      return;
    }
    
    if (maxCapacity === 0) {
      setFormErr("No student licenses allocated. Contact your enterprise administrator.");
      return;
    }
    
    setSubmitting(true);
    setFormErr(null);
    setSuccess(false);

    const { data, error } = await supabase.from("enterprise_students").insert({
      student_email: email.trim().toLowerCase(),
      enterprise_uuid: enterpriseUuid,
    }).select().single();

    setSubmitting(false);
    
    if (error) { 
      setFormErr(error.message); 
      return; 
    }
    
    if (data) {
      setEnrolled((prev) => [...prev, data as DBStudentCourse]);
    }
    setEmail("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleRemove(id: string) {
    const { error } = await supabase.from("enterprise_students").delete().eq("id", id);
    if (error) { 
      console.error(error.message); 
      return; 
    }
    setEnrolled((prev) => prev.filter((s) => s.id !== id));
  }

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8 min-h-screen" style={PAGE_BG}>
      <div className="text-center space-y-1">
        <p className="text-[#FF6996] text-xs uppercase tracking-[0.18em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>Error</p>
        <p className="text-white text-base" style={{ fontFamily: "'Montserrat', sans-serif" }}>{error}</p>
      </div>
    </div>
  );

  const maxCapacity = enterprisePlan?.curriculums_allocated ?? 0;
  const currentCount = enrolled.length;
  const isAtCapacity = maxCapacity > 0 && currentCount >= maxCapacity;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');`}</style>
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={{ ...PAGE_BG, fontFamily: "'Montserrat', sans-serif" }}>

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <img src="/fbx_logo.png" alt="FBX Logo" className="max-h-[7vh] max-w-full" />
          <div>
            <h1 className="text-white text-2xl font-bold tracking-wide">Teacher Dashboard</h1>
          </div>
        </div>
        <p className="text-white/100 text-sm font-light tracking-wide">
          {loading ? "Loading portal…" : `Welcome, ${dbUser?.client_name ?? "Teacher"}`}
        </p>
      </div>

      {/* No enterprise warning */}
      {!loading && !enterpriseUuid && (
        <div className="bg-[#FF6996]/5 border border-[#FF6996]/20 px-5 py-4 rounded-xl">
          <p className="text-[#FF6996] text-[10px] uppercase tracking-[0.18em] font-bold">Not linked to an enterprise</p>
          <p className="text-white text-xs mt-1">Contact your enterprise administrator to be added.</p>
        </div>
      )}

      {/* Capacity Banner */}
      {!loading && enterpriseUuid && (
        <CapacityBanner current={currentCount} max={maxCapacity} />
      )}

      {/* Stat card */}
      <div className="relative bg-[#0d0b1e] border border-[#D6BDF2]/20 p-5 overflow-hidden hover:border-[#D6BDF2]/40 transition-colors duration-300 rounded-xl">
        <div className="absolute inset-x-0 top-0 h-px bg-[#D6BDF2]/10" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-white font-bold mb-3">Students Enrolled</p>
        {loading
          ? <div className="h-10 bg-white/5 rounded w-12 animate-pulse" />
          : <p className="text-4xl font-light text-[#D6BDF2] tabular-nums">{String(enrolled.length).padStart(2, "0")}</p>
        }
      </div>

      {/* Enroll Students */}
      <SectionCard title="Enroll Students" icon={GraduationCap} count={enrolled.length} accent="violet">

        {/* Add form */}
        <div className="px-5 py-5">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1">
              <FieldLabel>Student Email</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isAtCapacity && handleAdd()}
                placeholder="student@university.edu"
                disabled={isAtCapacity || !enterpriseUuid}
                className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#D6BDF2]/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!email || submitting || loading || !enterpriseUuid || isAtCapacity}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#D6BDF2]/10 border border-[#D6BDF2]/20 rounded-lg text-[#D6BDF2] text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-[#D6BDF2]/15 transition disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              <UserPlus size={12} />
              {submitting ? "Adding…" : isAtCapacity ? "At Capacity" : "Add Student"}
            </button>
          </div>

          {formErr && (
            <div className="mt-3 flex items-center gap-2">
              <AlertCircle size={12} className="text-[#FF6996]" />
              <p className="text-[#FF6996] text-xs font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{formErr}</p>
            </div>
          )}

          {success && (
            <div className="mt-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#D6BDF2] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <CheckCircle2 size={10} /> Student added
              </span>
            </div>
          )}
        </div>

        {/* Enrolled list */}
        {(loading || enrolled.length > 0) && (
          <>
            <TableHeader cols={["Student", ""]} />
            {loading
              ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
              : enrolled.map((s) => (
                  <div key={s.id} className="px-5 py-3.5 grid sm:grid-cols-2 items-center gap-3 border-b border-white/[0.04] last:border-0">
                    <div className="flex items-center gap-3">
                      <Avatar initials={s.student_email.slice(0, 2).toUpperCase()} />
                      <span className="text-white text-sm truncate font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>{s.student_email}</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemove(s.id)}
                        title="Remove student"
                        className="text-white/40 hover:text-red-400 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
            }
          </>
        )}

        {!loading && enrolled.length === 0 && (
          <EmptyRow message="No students enrolled yet" />
        )}

      </SectionCard>

      <div className="pt-1">
        <a
          href={FUNBOTICS_DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D6BDF2]/10 border border-[#D6BDF2]/20 text-[#D6BDF2] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#D6BDF2]/15 transition"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Open Funbotics Docs
        </a>
      </div>

    </div>
    </>
  );
}