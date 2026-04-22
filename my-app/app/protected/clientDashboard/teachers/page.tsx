"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Users,
  GraduationCap,
  ArrowLeft,
  Plus,
  Trash2,
  Mail,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #0f262e 87%, #42696a 100%)',
};

// ─── ACCENTS ─────────────────────────────────────────────────────────────────
const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" },
  blue:   { text: "text-[#8AC7F4]", bg: "bg-[#8AC7F4]/10", border: "border-[#8AC7F4]/20" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" },
  teal:   { text: "text-[#7DE9E2]", bg: "bg-[#7DE9E2]/10", border: "border-[#7DE9E2]/20" },
};
type AccentKey = keyof typeof ACCENTS;

interface Teacher {
  id: string;
  client_name: string;
  email: string;
  user_uuid: string;
}

interface Student {
  id: string;
  student_email: string;
}

interface DBPlan {
  id: string;
  user_uuid: string;
  curriculums_allocated: number;
}

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ initials, accent = "blue" }: { initials: string; accent?: AccentKey }) {
  const s: Record<AccentKey, string> = {
    pink:  "bg-[#c975b9]/10 text-[#c975b9] ring-1 ring-[#c975b9]/25",
    blue:  "bg-[#8AC7F4]/10 text-[#8AC7F4] ring-1 ring-[#8AC7F4]/25",
    slate: "bg-[#91bee3]/10 text-[#91bee3] ring-1 ring-[#91bee3]/25",
    teal:  "bg-[#7DE9E2]/10 text-[#7DE9E2] ring-1 ring-[#7DE9E2]/25",
  };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${s[accent]}`}>
      {initials}
    </div>
  );
}

function SectionCard({ title, icon: Icon, count, accent = "blue", children }: {
  title: string; icon: React.ElementType; count?: number; accent?: AccentKey; children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-xl bg-[#0d0b1e] border ${a.border} overflow-hidden`}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center`}>
            <Icon size={14} className={a.text} />
          </div>
          <h2 className="text-white/100 text-xs uppercase tracking-[0.18em] font-bold">{title}</h2>
        </div>
        {count !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${a.bg} ${a.text} tracking-wider`}>
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
    <div
      className="hidden sm:grid px-5 py-3 border-b border-white/[0.06]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}
    >
      {cols.map((c) => (
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/100 font-bold">{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-white/100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/100 rounded w-1/3" />
        <div className="h-2.5 bg-white/100 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-8 text-center text-white/100 text-xs tracking-[0.18em] uppercase">
      {message}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.18em] text-white/100 font-bold mb-1.5">{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = "text", disabled = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#8AC7F4]/40 focus:outline-none text-white/100 text-sm placeholder:text-white/100 transition disabled:opacity-40 disabled:cursor-not-allowed"
    />
  );
}

// Capacity Banner Component
function CapacityBanner({ current, max, isAtCapacity }: { current: number; max: number; isAtCapacity: boolean }) {
  const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
  
  if (max === 0) {
    return (
      <div className="bg-[#FF6996]/5 border border-[#FF6996]/20 rounded-xl px-5 py-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle size={12} className="text-[#FF6996]" />
          <p className="text-[#FF6996] text-xs uppercase tracking-[0.18em]">No licenses allocated</p>
        </div>
        <p className="text-white/100 text-xs mt-1">Contact your enterprise administrator to add student capacity.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-5 py-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <GraduationCap size={12} className="text-[#8AC7F4]" />
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/100 font-bold">Student Capacity</span>
        </div>
        <span className={`text-[10px] font-bold ${isAtCapacity ? "text-[#c975b9]" : "text-[#8AC7F4]"}`}>
          {current} / {max} used
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${isAtCapacity ? "bg-[#c975b9]" : "bg-[#8AC7F4]"}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      {isAtCapacity && (
        <p className="text-[#c975b9] text-[10px] mt-2 flex items-center gap-1">
          <AlertCircle size={10} /> Capacity reached. Cannot add more students.
        </p>
      )}
    </div>
  );
}

// Create Teacher Modal
function CreateTeacherModal({ enterpriseUuid, onClose, onCreated }: {
  enterpriseUuid: string; onClose: () => void; onCreated: (teacher: Teacher, password: string) => void;
}) {
  const supabase = createClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [done, setDone] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<Teacher | null>(null);
  const [createdPassword, setCreatedPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [existingUserData, setExistingUserData] = useState<{ uuid: string; name: string } | null>(null);

  // Check if user exists when email is entered
  async function checkUserExists(emailToCheck: string) {
    if (!emailToCheck) {
      setIsExistingUser(false);
      setExistingUserData(null);
      return;
    }
    
    // Use the RPC function that bypasses RLS
    const { data, error } = await supabase
      .rpc('get_user_by_email', { user_email: emailToCheck });
    
    if (error || !data || data.length === 0) {
      setIsExistingUser(false);
      setExistingUserData(null);
      return;
    }
    
    const user = data[0];
    setIsExistingUser(true);
    setExistingUserData({ uuid: user.user_uuid, name: user.client_name || "" });
    
    // Auto-populate name if name field is empty
    if (user.client_name && !name) {
      setName(user.client_name);
    }
  }

  async function handleCreate() {
    if (!name || !email) return;
    
    // For new users, password is required
    if (!isExistingUser && !password) {
      setErr("Password is required for new accounts.");
      return;
    }
    
    setCreating(true);
    setErr(null);
  
    try {
      const { data: { session: existingSession } } = await supabase.auth.getSession();
      let teacherUuid: string;
      
      if (isExistingUser && existingUserData) {
        // EXISTING USER PATH - just link them
        teacherUuid = existingUserData.uuid;
        
        // Update name if changed and different
        if (name && existingUserData.name !== name) {
          const { error: updateError } = await supabase
            .from("users")
            .update({ client_name: name })
            .eq("user_uuid", teacherUuid);
          
          if (updateError) {
            console.error("Failed to update name:", updateError);
          }
        }
      } else {
        // NEW USER PATH - create auth user
        const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
        if (authErr || !authData.user) {
          setErr(authErr?.message ?? "Sign-up failed");
          setCreating(false);
          return;
        }
        
        teacherUuid = authData.user.id;
        
        // Insert into users table
        const { error: upsertErr } = await supabase.from("users").upsert(
          { 
            client_name: name, 
            user_uuid: teacherUuid, 
            is_admin: 0, 
            role: 0,
            email: email
          },
          { onConflict: "user_uuid" }
        );
        
        if (upsertErr) {
          setErr(upsertErr.message);
          setCreating(false);
          return;
        }
      }
      
      // Check if teacher is already linked to this enterprise
      const { data: existingLink } = await supabase
        .from("enterprise_teachers")
        .select("id")
        .eq("enterprise_uuid", enterpriseUuid)
        .eq("client_uuid", teacherUuid)
        .maybeSingle();
      
      if (existingLink) {
        setErr("This user is already a teacher for your enterprise.");
        setCreating(false);
        return;
      }
      
      // Link teacher to enterprise
      const { error: linkErr } = await supabase.from("enterprise_teachers").insert({
        enterprise_uuid: enterpriseUuid,
        client_uuid: teacherUuid,
      });
      
      if (linkErr) {
        setErr(linkErr.message);
        setCreating(false);
        return;
      }
      
      // Restore original session if we created a new user (not for existing users)
      if (!isExistingUser && existingSession) {
        await supabase.auth.setSession({
          access_token: existingSession.access_token,
          refresh_token: existingSession.refresh_token,
        });
      }
      
      // Get final user data
      const { data: userData } = await supabase
        .from("users")
        .select("email, client_name")
        .eq("user_uuid", teacherUuid)
        .single();
      
      const newTeacher = {
        id: teacherUuid,
        client_name: userData?.client_name || name,
        email: userData?.email || email,
        user_uuid: teacherUuid,
      };
      
      setCreatedTeacher(newTeacher);
      if (!isExistingUser && password) {
        setCreatedPassword(password);
      } else {
        setCreatedPassword("(existing user - linked to enterprise)");
      }
      setDone(true);
      onCreated(newTeacher, isExistingUser ? "" : password);
      
    } catch (err: unknown) {
      setErr(err instanceof Error ? err.message : "Failed to create or link teacher");
    } finally {
      setCreating(false);
    }
  }

  if (done && createdTeacher) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-8 max-w-sm w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#7DE9E2]/10 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-[#7DE9E2]" />
        </div>
        <p className="text-white/100 text-xs uppercase tracking-[0.18em] font-bold">
          {createdPassword === "(existing user - linked to enterprise)" 
            ? "Teacher Linked Successfully" 
            : "Teacher Account Created"}
        </p>
        <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 text-left space-y-2">
          <div><p className="text-[10px] text-white/100 uppercase tracking-widest font-bold mb-0.5">Name</p><p className="text-white/100 text-sm">{createdTeacher.client_name}</p></div>
          <div><p className="text-[10px] text-white/100 uppercase tracking-widest font-bold mb-0.5">Email</p><p className="text-white/100 text-sm font-mono">{createdTeacher.email}</p></div>
          {createdPassword && createdPassword !== "(existing user - linked to enterprise)" && (
            <div><p className="text-[10px] text-white/100 uppercase tracking-widest font-bold mb-0.5">Password</p><p className="text-white/100 text-sm font-mono">{createdPassword}</p></div>
          )}
        </div>
        <p className="text-white/100 text-xs">
          {createdPassword === "(existing user - linked to enterprise)" 
            ? "The user has been added as a teacher to your enterprise." 
            : "Save these credentials — they won't be shown again."}
        </p>
        <button onClick={onClose} className="mt-1 px-6 py-2 rounded-lg border border-white/[0.08] text-white/100 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/100 hover:text-white/100 transition">Done</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-6 max-w-md w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#7DE9E2]/10 flex items-center justify-center">
              <UserPlus size={14} className="text-[#7DE9E2]" />
            </div>
            <span className="text-white/100 text-xs uppercase tracking-[0.18em] font-bold">
              {isExistingUser ? "Link Existing Teacher" : "Create Teacher Account"}
            </span>
          </div>
          <button onClick={onClose} className="text-white/100 hover:text-white/100 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div>
            <FieldLabel>Full Name</FieldLabel>
            <TextInput value={name} onChange={setName} placeholder="e.g. Jane Smith" />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput 
              value={email} 
              onChange={(value) => {
                setEmail(value);
                checkUserExists(value);
              }} 
              placeholder="teacher@school.edu" 
              type="email" 
            />
          </div>
          {!isExistingUser && (
            <div>
              <FieldLabel>Password <span className="text-[#c975b9]">*</span></FieldLabel>
              <TextInput 
                value={password} 
                onChange={setPassword} 
                placeholder="Min. 8 characters" 
                type="password" 
              />
            </div>
          )}
          {isExistingUser && (
            <div className="bg-[#7DE9E2]/5 border border-[#7DE9E2]/20 rounded-lg p-3">
              <p className="text-[#7DE9E2] text-xs">✓ This user already exists. They will be linked as a teacher to your enterprise.</p>
            </div>
          )}
          {err && <p className="text-[#c975b9] text-xs tracking-wide">{err}</p>}
          <p className="text-white/100 text-xs">
            {isExistingUser 
              ? "This user will be added as a teacher to your enterprise. No new account will be created."
              : "Let the teacher know the email and password you used and they can change it when they login."}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/100 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/[0.14] hover:text-white/100 transition">Cancel</button>
          <button 
            onClick={handleCreate} 
            disabled={!name || !email || creating || (!isExistingUser && !password)} 
            className="flex-1 py-2.5 rounded-lg bg-[#7DE9E2]/10 border border-[#7DE9E2]/20 text-[#7DE9E2] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#7DE9E2]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {creating ? "Processing…" : isExistingUser ? "Link Teacher" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Add Student Modal with capacity check
function AddStudentModal({ enterpriseUuid, maxCapacity, currentCount, onClose, onAdded }: {
  enterpriseUuid: string; maxCapacity: number; currentCount: number; onClose: () => void; onAdded: (email: string) => void;
}) {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  const isAtCapacity = maxCapacity > 0 && currentCount >= maxCapacity;

  async function handleAdd() {
    if (!email) return;
    
    // Double-check capacity before adding
    if (maxCapacity > 0 && currentCount >= maxCapacity) {
      setErr(`Cannot add student. Maximum capacity of ${maxCapacity} students reached.`);
      return;
    }
    
    setAdding(true);
    setErr(null);

    const { error } = await supabase.from("enterprise_students").insert({
      enterprise_uuid: enterpriseUuid,
      student_email: email,
    });

    setAdding(false);
    if (error) { 
      setErr(error.message); 
      return; 
    }
    onAdded(email);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-6 max-w-md w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#8AC7F4]/10 flex items-center justify-center">
              <GraduationCap size={14} className="text-[#8AC7F4]" />
            </div>
            <span className="text-white/100 text-xs uppercase tracking-[0.18em] font-bold">Add Student</span>
          </div>
          <button onClick={onClose} className="text-white/100 hover:text-white/100 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div><FieldLabel>Student Email</FieldLabel><TextInput value={email} onChange={setEmail} placeholder="student@school.edu" type="email" disabled={isAtCapacity} /></div>
          {isAtCapacity && (
            <div className="flex items-center gap-2 text-[#c975b9] text-xs">
              <AlertCircle size={12} />
              <span>Maximum capacity reached. Cannot add more students.</span>
            </div>
          )}
          {err && <p className="text-[#c975b9] text-xs tracking-wide">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/100 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/[0.14] hover:text-white/100 transition">Cancel</button>
          <button 
            onClick={handleAdd} 
            disabled={!email || adding || isAtCapacity} 
            className="flex-1 py-2.5 rounded-lg bg-[#8AC7F4]/10 border border-[#8AC7F4]/20 text-[#8AC7F4] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#8AC7F4]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {adding ? "Adding…" : isAtCapacity ? "At Capacity" : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeachersPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const action = searchParams?.get("action");

  const [enterpriseUuid, setEnterpriseUuid] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enterprisePlan, setEnterprisePlan] = useState<DBPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherModalOpen, setTeacherModalOpen] = useState(action === "createTeacher");
  const [studentModalOpen, setStudentModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { 
        setError("Not authenticated"); 
        setLoading(false); 
        return; 
      }
  
      setEnterpriseUuid(user.id);
  
      try {
        // Step 1: Get teacher links from enterprise_teachers
        const teachersRes = await supabase
          .from("enterprise_teachers")
          .select("client_uuid")
          .eq("enterprise_uuid", user.id);
  
        if (teachersRes.error) throw new Error(teachersRes.error.message);
  
        const teacherUuids = teachersRes.data?.map((t) => t.client_uuid) ?? [];
        
        // Step 2: Get teacher details from users table
        if (teacherUuids.length > 0) {
          const userDataRes = await supabase
            .from("users")
            .select("user_uuid, client_name, email")
            .in("user_uuid", teacherUuids);
          
          if (!userDataRes.error && userDataRes.data) {
            const mappedTeachers = userDataRes.data.map((u) => ({
              id: u.user_uuid,
              client_name: u.client_name,
              email: u.email || "",
              user_uuid: u.user_uuid,
            }));
            setTeachers(mappedTeachers);
          } else {
            setTeachers([]);
          }
        } else {
          setTeachers([]);
        }
  
        // Step 3: Get students
        const studentsRes = await supabase
          .from("enterprise_students")
          .select("*")
          .eq("enterprise_uuid", user.id);
        
        setStudents(studentsRes.data ?? []);
  
        // Step 4: Get plan
        const planRes = await supabase
          .from("plans")
          .select("*")
          .eq("user_uuid", user.id)
          .maybeSingle();
        
        setEnterprisePlan(planRes.data ?? null);
  
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [supabase]);

  // REMOVED: handleDeleteTeacher function - teachers cannot be deleted

  async function handleDeleteStudent(studentId: string) {
    const { error } = await supabase
      .from("enterprise_students")
      .delete()
      .eq("id", studentId);
    
    if (error) { console.error("Failed to delete student:", error.message); return; }
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  }

  function handleTeacherCreated(teacher: Teacher) {
    setTeachers((prev) => [...prev, teacher]);
  }

  function handleStudentAdded(email: string) {
    setStudents((prev) => [...prev, { id: Date.now().toString(), student_email: email }]);
  }

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

  const maxCapacity = enterprisePlan?.curriculums_allocated ?? 0;
  const currentCount = students.length;
  const isAtCapacity = maxCapacity > 0 && currentCount >= maxCapacity;

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>
      
      {teacherModalOpen && enterpriseUuid && (
        <CreateTeacherModal
          enterpriseUuid={enterpriseUuid}
          onClose={() => setTeacherModalOpen(false)}
          onCreated={handleTeacherCreated}
        />
      )}
      {studentModalOpen && enterpriseUuid && (
        <AddStudentModal
          enterpriseUuid={enterpriseUuid}
          maxCapacity={maxCapacity}
          currentCount={currentCount}
          onClose={() => setStudentModalOpen(false)}
          onAdded={handleStudentAdded}
        />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/protected/clientDashboard")}
            className="flex items-center gap-1.5 text-white/100 hover:text-white/100 text-[10px] font-bold uppercase tracking-[0.18em] transition"
          >
            <ArrowLeft size={11} />Back
          </button>
        </div>
        <div>
          <h1 className="text-white/100 text-2xl font-bold tracking-wide">Teachers & Students</h1>
          <p className="text-white/100 text-sm font-light tracking-wide mt-1">Manage your educational staff and learners</p>
        </div>
      </div>

      {/* Capacity Banner */}
      {!loading && enterpriseUuid && (
        <CapacityBanner current={currentCount} max={maxCapacity} isAtCapacity={isAtCapacity} />
      )}

      {/* Teachers Section - Delete button removed */}
      <SectionCard title="Teachers" icon={UserPlus} count={teachers.length} accent="teal">
        <div className="px-5 py-4 border-b border-white/[0.06] flex justify-end">
          <button
            onClick={() => setTeacherModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7DE9E2]/10 border border-[#7DE9E2]/20 text-[#7DE9E2] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#7DE9E2]/15 transition"
          >
            <Plus size={12} />Add Teacher
          </button>
        </div>

        <TableHeader cols={["Teacher", "Email"]} />
        
        {loading ? (
          [1, 2].map((i) => <LoadingRow key={i} />)
        ) : teachers.length === 0 ? (
          <EmptyRow message="No teachers added yet" />
        ) : (
          teachers.map((t) => (
            <div
              key={t.id}
              className="px-5 py-4 grid sm:grid-cols-2 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={getInitials(t.client_name)} accent="teal" />
                <p className="text-white/100 text-sm">{t.client_name}</p>
              </div>
              <div className="flex items-center gap-2 text-white/100 text-sm">
                <Mail size={12} className="text-white/100" />
                <span className="truncate">{t.email}</span>
              </div>
            </div>
          ))
        )}
      </SectionCard>

      {/* Students Section */}
      <SectionCard title="Students" icon={GraduationCap} count={students.length} accent="blue">
        <div className="px-5 py-4 border-b border-white/[0.06] flex justify-end">
          <button
            onClick={() => setStudentModalOpen(true)}
            disabled={isAtCapacity}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.18em] transition ${
              isAtCapacity 
                ? "bg-white/[0.03] border border-white/[0.06] text-white/100 cursor-not-allowed" 
                : "bg-[#8AC7F4]/10 border border-[#8AC7F4]/20 text-[#8AC7F4] hover:bg-[#8AC7F4]/15"
            }`}
          >
            <Plus size={12} />{isAtCapacity ? "At Capacity" : "Add Student"}
          </button>
        </div>

        <TableHeader cols={["Student Email", ""]} />
        
        {loading ? (
          [1, 2].map((i) => <LoadingRow key={i} />)
        ) : students.length === 0 ? (
          <EmptyRow message="No students added yet" />
        ) : (
          students.map((s) => (
            <div
              key={s.id}
              className="px-5 py-4 grid sm:grid-cols-2 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={s.student_email.charAt(0).toUpperCase()} accent="blue" />
                <p className="text-white/100 text-sm">{s.student_email}</p>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDeleteStudent(s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-white/100 hover:text-red-400 p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </SectionCard>
    </div>
  );
}