"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  UserPlus,
  CheckCircle2,
  Trash2,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

// ─── ACCENTS ─────────────────────────────────────────────────────────────────

const ACCENTS = {
  violet: { text: "text-[#9b7fe8]", bg: "bg-[#9b7fe8]/10", border: "border-[#9b7fe8]/20" },
  slate:  { text: "text-[#7e8fb5]", bg: "bg-[#7e8fb5]/10", border: "border-[#7e8fb5]/20" },
  pink:   { text: "text-[#e8629a]", bg: "bg-[#e8629a]/10", border: "border-[#e8629a]/20" },
};
type AccentKey = keyof typeof ACCENTS;

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, count, accent = "violet", children }: {
  title: string; icon: LucideIcon; count?: number; accent?: AccentKey; children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="bg-[#0d0c14] border border-white/[0.06]">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Icon size={15} className={a.text} />
          <h2 className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">{title}</h2>
        </div>
        {count !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 ${a.bg} ${a.text} tracking-wider`}>
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
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/20 font-medium">{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.04]">
      <div className="w-10 h-10 rounded-md bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-5 py-8 text-center text-white/15 text-xs tracking-[0.18em] uppercase">{message}</div>;
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 bg-[#9b7fe8]/10 text-[#9b7fe8] ring-1 ring-[#9b7fe8]/25">
      {initials}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{children}</p>;
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function TeacherPortal() {
  const supabase = createClient();

  const [dbUser, setDbUser]                     = useState<DBUser | null>(null);
  const [enrolled, setEnrolled]                 = useState<DBStudentCourse[]>([]);
  const [enterpriseUuid, setEnterpriseUuid]     = useState<string | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);

  const [email, setEmail]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [formErr, setFormErr]       = useState<string | null>(null);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      try {
        // Fetch user row, enterprise link, and existing students in parallel
        const [userRes, teacherRes] = await Promise.all([
          supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
          supabase.from("enterprise_teachers").select("enterprise_uuid").eq("client_uuid", user.id).limit(1).maybeSingle(),
        ]);
        if (userRes.error)    throw new Error(`User: ${userRes.error.message}`);
        if (teacherRes.error) throw new Error(`Enterprise: ${teacherRes.error.message}`);

        const entUuid = teacherRes.data?.enterprise_uuid ?? null;
        setDbUser(userRes.data ?? null);
        setEnterpriseUuid(entUuid);

        // Now fetch students for this enterprise
        if (entUuid) {
          const { data: studentsData, error: studentsErr } = await supabase
            .from("enterprise_students")
            .select("*")
            .eq("enterprise_uuid", entUuid);
          if (studentsErr) throw new Error(`Students: ${studentsErr.message}`);
          setEnrolled(studentsData ?? []);
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
    setSubmitting(true);
    setFormErr(null);
    setSuccess(false);

    const { data, error } = await supabase.from("enterprise_students").insert({
      student_email:   email.trim().toLowerCase(),
      enterprise_uuid: enterpriseUuid,
    }).select().single();

    setSubmitting(false);
    if (error) { setFormErr(error.message); return; }
    if (data) setEnrolled((prev) => [...prev, data as DBStudentCourse]);
    setEmail("");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  }

  async function handleRemove(id: string) {
    const { error } = await supabase.from("enterprise_students").delete().eq("id", id);
    if (error) { console.error(error.message); return; }
    setEnrolled((prev) => prev.filter((s) => s.id !== id));
  }

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#080710]">
      <div className="text-center space-y-1">
        <p className="text-[#e8629a] text-xs uppercase tracking-[0.18em]">Error</p>
        <p className="text-white/30 text-base">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto bg-[#080710] min-h-screen">

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/20 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-light tracking-wide">
          {loading ? "Portal" : `Welcome, ${dbUser?.client_name ?? "Teacher"}`}
        </h1>
      </div>

      {/* No enterprise warning */}
      {!loading && !enterpriseUuid && (
        <div className="bg-[#e8629a]/5 border border-[#e8629a]/20 px-5 py-4">
          <p className="text-[#e8629a] text-xs uppercase tracking-[0.18em]">Not linked to an enterprise</p>
          <p className="text-white/25 text-xs mt-1">Contact your enterprise administrator to be added.</p>
        </div>
      )}

      {/* Stat card */}
      <div className="relative bg-[#0d0c14] border border-white/[0.06] p-5 overflow-hidden hover:border-white/10 transition-colors duration-300">
        <div className="absolute inset-x-0 top-0 h-px bg-[#9b7fe8]/10" />
        <p className="text-xs uppercase tracking-[0.18em] text-white/25 font-medium mb-3">Students Enrolled</p>
        {loading
          ? <div className="h-10 bg-white/5 rounded w-12 animate-pulse" />
          : <p className="text-4xl font-light text-[#9b7fe8] tabular-nums">{String(enrolled.length).padStart(2, "0")}</p>
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
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="student@university.edu"
                className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!email || submitting || loading || !enterpriseUuid}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-[10px] uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <UserPlus size={12} />
              {submitting ? "Adding…" : "Add Student"}
            </button>
          </div>

          {formErr && <p className="text-[#e8629a] text-xs mt-3">{formErr}</p>}

          {success && (
            <div className="mt-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#9b7fe8]">
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
                      <span className="text-white/50 text-sm truncate">{s.student_email}</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleRemove(s.id)}
                        title="Remove student"
                        className="text-white/15 hover:text-red-400 transition"
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

    </div>
  );
}