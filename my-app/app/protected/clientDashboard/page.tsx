"use client";
import { useState, useEffect } from "react";
import {
  Package,
  TicketCheck,
  ExternalLink,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  UserPlus,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import OrderModal from "@/components/dashboardComponents/orderModal";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #0f262e 87%, #42696a 100%)',
};

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface DBUser {
  id: string;
  client_name: string;
  is_admin: number;
  user_uuid: string;
  role: number;
}
interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
}
interface DBTicket {
  id: string;
  title: string;
  contact_details: string;
  ticket_details: string;
  client_name: string;
  user_uuid: string;
  resolved: number;
}
interface DBPlan {
  id: string;
  user_uuid: string;
  robots_shipped: number;
  price: number;
  robots_allocated: number;
  description: string;
  created_at: string;
}
interface ModalOrder {
  title: string;
  description: string;
  price: string;
  trackingNumber: string;
}

// ─── ACCENTS ─────────────────────────────────────────────────────────────────
const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" },
  blue:   { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10", border: "border-[#629fcc]/20" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" },
  teal:   { text: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/20" },
};
type AccentKey = keyof typeof ACCENTS;

type Status = "in_transit" | "delivered" | "processing" | "delayed";
const STATUS_CONFIG: Record<Status, { label: string; accent: AccentKey; icon: LucideIcon }> = {
  in_transit: { label: "In Transit", accent: "slate",  icon: Truck },
  delivered:  { label: "Delivered",  accent: "blue",   icon: CheckCircle2 },
  processing: { label: "Processing", accent: "pink",   icon: Clock },
  delayed:    { label: "Delayed",    accent: "pink",   icon: AlertCircle },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
function deriveStatus(order: DBOrder): Status {
  return order.tracking_number ? "in_transit" : "processing";
}
function toModalOrder(o: DBOrder): ModalOrder {
  return { title: o.order_title, description: o.description, price: o.price, trackingNumber: o.tracking_number };
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function Avatar({ initials, accent = "blue" }: { initials: string; accent?: AccentKey }) {
  const s: Record<AccentKey, string> = {
    pink:  "bg-[#c975b9]/10 text-[#c975b9] ring-1 ring-[#c975b9]/25",
    blue:  "bg-[#629fcc]/10 text-[#629fcc] ring-1 ring-[#629fcc]/25",
    slate: "bg-[#91bee3]/10 text-[#91bee3] ring-1 ring-[#91bee3]/25",
    teal:  "bg-[#4ecdc4]/10 text-[#4ecdc4] ring-1 ring-[#4ecdc4]/25",
  };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${s[accent]}`}>
      {initials}
    </div>
  );
}

function SectionCard({ title, icon: Icon, count, accent = "blue", children }: {
  title: string; icon: LucideIcon; count?: number; accent?: AccentKey; children: React.ReactNode;
}) {
  const a = ACCENTS[accent];
  return (
    <div className={`rounded-xl bg-[#0d0b1e] border ${a.border} overflow-hidden`}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg ${a.bg} flex items-center justify-center`}>
            <Icon size={14} className={a.text} />
          </div>
          <h2 className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">{title}</h2>
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
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
      <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-8 text-center text-white/20 text-xs tracking-[0.18em] uppercase">
      {message}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const a = ACCENTS[cfg.accent];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${a.bg} ${a.text} border ${a.border}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

function TrackingCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-1.5 group/copy"
      title="Copy tracking number"
    >
      <span className="text-xs text-white/30 font-mono truncate max-w-[140px]">{value}</span>
      {copied
        ? <Check size={11} className="text-[#629fcc] flex-shrink-0" />
        : <Copy size={11} className="text-white/20 flex-shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
      }
    </button>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] uppercase tracking-[0.18em] text-white/85 font-bold mb-1.5">{children}</p>;
}

function TextInput({ value, onChange, placeholder, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#629fcc]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/25 transition"
    />
  );
}

// ─── CONTRACT SECTION ─────────────────────────────────────────────────────────
function ContractSection({ plan, loading }: { plan: DBPlan | null; loading: boolean }) {
  if (loading) return <LoadingRow />;
  if (!plan) return <EmptyRow message="No contract on file — contact your FBX representative" />;

  const shipped   = plan.robots_shipped   ?? 0;
  const allocated = plan.robots_allocated ?? 0;
  const pct       = allocated > 0 ? Math.min(100, Math.round((shipped / allocated) * 100)) : 0;
  const since     = new Date(plan.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="divide-y divide-white/[0.06]">
      {/* Key metrics */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06]">
        {[
          { label: "Contract Value",    value: `$${plan.price?.toLocaleString() ?? "—"}`, accent: "teal"  as AccentKey },
          { label: "Robots Shipped",    value: `${shipped}`,                               accent: "blue"  as AccentKey },
          { label: "Robots Allocated",  value: `${allocated}`,                             accent: "slate" as AccentKey },
        ].map(({ label, value, accent }) => {
          const a = ACCENTS[accent];
          return (
            <div key={label} className="relative p-5">
              <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-2">{label}</p>
              <p className={`text-3xl font-light tabular-nums ${a.text}`}>{value}</p>
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="px-5 py-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Fulfillment Progress</span>
          <span className="text-[10px] text-[#4ecdc4] tabular-nums font-bold">{pct}%</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div className="h-full bg-[#4ecdc4] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-white/20">{shipped} of {allocated} units shipped</p>
      </div>
      {/* Description & date */}
      {plan.description && (
        <div className="px-5 py-4 space-y-1">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold">Contract Notes</p>
          <p className="text-white/40 text-sm leading-relaxed">{plan.description}</p>
        </div>
      )}
      <div className="px-5 py-3">
        <p className="text-[10px] text-white/20">Contract established {since}</p>
      </div>
    </div>
  );
}

// ─── TICKET DETAIL MODAL ──────────────────────────────────────────────────────
function TicketDetailModal({ ticket, onClose, onResolve }: {
  ticket: DBTicket; onClose: () => void;
  onResolve: (t: DBTicket) => Promise<void>;
}) {
  const [working, setWorking] = useState<"resolve" | null>(null);
  const isResolved = ticket.resolved === 1;

  async function handle(action: "resolve") {
    setWorking(action);
    if (action === "resolve") await onResolve(ticket);
    setWorking(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-6 max-w-sm w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isResolved ? "bg-[#91bee3]/10" : "bg-[#c975b9]/10"}`}>
              <TicketCheck size={14} className={isResolved ? "text-[#91bee3]" : "text-[#c975b9]"} />
            </div>
            <span className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Ticket Detail</span>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Title</p>
            <p className="text-white/70 text-sm">{ticket.title}</p>
          </div>
          {ticket.contact_details && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Contact</p>
              <p className="text-white/45 text-sm">{ticket.contact_details}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Details</p>
            <p className="text-white/45 text-sm leading-relaxed">{ticket.ticket_details}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Status</p>
            {isResolved
              ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#91bee3]"><CheckCircle2 size={10} /> Resolved</span>
              : <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c975b9]"><Clock size={10} /> Open</span>
            }
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          {!isResolved && (
            <button
              onClick={() => handle("resolve")}
              disabled={!!working}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#629fcc]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={11} />{working === "resolve" ? "Resolving…" : "Resolve"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SUBMIT TICKET MODAL ──────────────────────────────────────────────────────
function SubmitTicketModal({ userUuid, clientName, onClose, onSubmitted }: {
  userUuid: string; clientName: string; onClose: () => void; onSubmitted: (t: DBTicket) => void;
}) {
  const supabase = createClient();
  const [title, setTitle]     = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title || !details) return;
    setSubmitting(true);
    const { data, error } = await supabase.from("tickets").insert({
      title, contact_details: contact, ticket_details: details,
      client_name: clientName, user_uuid: userUuid, resolved: 0,
    }).select().single();
    setSubmitting(false);
    if (error) { setErr(error.message); return; }
    if (data) onSubmitted(data as DBTicket);
    setSubmitted(true);
  }

  if (submitted) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-8 max-w-sm w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#629fcc]/10 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-[#629fcc]" />
        </div>
        <p className="text-white/60 text-xs uppercase tracking-[0.18em] font-bold">Ticket Submitted</p>
        <p className="text-white/25 text-xs">We&apos;ll get back to you within 24 hours.</p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2 rounded-lg border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/15 hover:text-white/60 transition"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-6 max-w-md w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#c975b9]/10 flex items-center justify-center">
              <TicketCheck size={14} className="text-[#c975b9]" />
            </div>
            <span className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Submit Ticket</span>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div><FieldLabel>Title</FieldLabel><TextInput value={title} onChange={setTitle} placeholder="e.g. Shipment issue" /></div>
          <div><FieldLabel>Contact</FieldLabel><TextInput value={contact} onChange={setContact} placeholder="Email or phone" /></div>
          <div>
            <FieldLabel>Details</FieldLabel>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Describe your issue…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#629fcc]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/25 transition resize-none"
            />
          </div>
          {err && <p className="text-[#c975b9] text-xs tracking-wide">{err}</p>}
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/30 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/[0.14] hover:text-white/50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title || !details || submitting}
            className="flex-1 py-2.5 rounded-lg bg-[#c975b9]/10 border border-[#c975b9]/25 text-[#c975b9] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#c975b9]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE TEACHER MODAL ─────────────────────────────────────────────────────
function CreateTeacherModal({ enterpriseUuid, onClose }: { enterpriseUuid: string; onClose: () => void }) {
  const supabase = createClient();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [done, setDone]         = useState(false);
  const [err, setErr]           = useState<string | null>(null);

  async function handleCreate() {
    if (!name || !email || !password) return;
    setCreating(true);
    setErr(null);
    const { data: { session: existingSession } } = await supabase.auth.getSession();
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr || !authData.user) { setErr(authErr?.message ?? "Sign-up failed"); setCreating(false); return; }
    const teacherUuid = authData.user.id;
    const { error: upsertErr } = await supabase.from("users").upsert(
      { client_name: name, user_uuid: teacherUuid, is_admin: 0, role: 0 },
      { onConflict: "user_uuid" }
    );
    const { error: linkErr } = await supabase.from("enterprise_teachers").insert({
      enterprise_uuid: enterpriseUuid,
      client_uuid:     teacherUuid,
    });
    if (existingSession) {
      await supabase.auth.setSession({
        access_token:  existingSession.access_token,
        refresh_token: existingSession.refresh_token,
      });
    }
    setCreating(false);
    if (upsertErr) { setErr(upsertErr.message); return; }
    if (linkErr)   { setErr(linkErr.message);   return; }
    setDone(true);
  }

  if (done) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-8 max-w-sm w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#4ecdc4]/10 flex items-center justify-center">
          <CheckCircle2 size={22} className="text-[#4ecdc4]" />
        </div>
        <p className="text-white/60 text-xs uppercase tracking-[0.18em] font-bold">Teacher Account Created</p>
        <div className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 text-left space-y-2">
          <div><p className="text-[10px] text-white/25 uppercase tracking-widest font-bold mb-0.5">Name</p><p className="text-white/60 text-sm">{name}</p></div>
          <div><p className="text-[10px] text-white/25 uppercase tracking-widest font-bold mb-0.5">Email</p><p className="text-white/60 text-sm font-mono">{email}</p></div>
          <div><p className="text-[10px] text-white/25 uppercase tracking-widest font-bold mb-0.5">Password</p><p className="text-white/60 text-sm font-mono">{password}</p></div>
        </div>
        <p className="text-white/20 text-xs">Save these credentials — they won&apos;t be shown again.</p>
        <button
          onClick={onClose}
          className="mt-1 px-6 py-2 rounded-lg border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/15 hover:text-white/60 transition"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0a0820]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.12] rounded-xl p-6 max-w-md w-full shadow-[0_16px_48px_rgba(0,0,0,0.55)] flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#4ecdc4]/10 flex items-center justify-center">
              <UserPlus size={14} className="text-[#4ecdc4]" />
            </div>
            <span className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Create Teacher Account</span>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 transition text-lg leading-none">×</button>
        </div>
        <div className="space-y-3">
          <div><FieldLabel>Full Name</FieldLabel><TextInput value={name} onChange={setName} placeholder="e.g. Jane Smith" /></div>
          <div><FieldLabel>Email</FieldLabel><TextInput value={email} onChange={setEmail} placeholder="teacher@school.edu" type="email" /></div>
          <div><FieldLabel>Password</FieldLabel><TextInput value={password} onChange={setPassword} placeholder="Min. 8 characters" type="password" /></div>
          {err && <p className="text-[#c975b9] text-xs tracking-wide">{err}</p>}
          <p className="text-white/20 text-xs">The teacher will receive a confirmation email and can log in to the Teacher Portal.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/30 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/[0.14] hover:text-white/50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || !email || !password || creating}
            className="flex-1 py-2.5 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#4ecdc4]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {creating ? "Creating…" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function EnterprisePortal() {
  const supabase = createClient();
  const [dbUser, setDbUser]                   = useState<DBUser | null>(null);
  const [dbPlan, setDbPlan]                   = useState<DBPlan | null>(null);
  const [dbOrders, setDbOrders]               = useState<DBOrder[]>([]);
  const [openTickets, setOpenTickets]         = useState<DBTicket[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<DBTicket[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [submitOpen, setSubmitOpen]               = useState(false);
  const [selectedOrder, setSelectedOrder]         = useState<ModalOrder | null>(null);
  const [selectedTicket, setSelectedTicket]       = useState<DBTicket | null>(null);
  const [teacherModalOpen, setTeacherModalOpen]   = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }
      try {
        const [userRes, planRes, ordersRes, openRes, resolvedRes] = await Promise.all([
          supabase.from("users").select("*").eq("user_uuid", user.id).limit(1).maybeSingle(),
          supabase.from("plans").select("*").eq("user_uuid", user.id).maybeSingle(),
          supabase.from("orders").select("*").eq("user_uuid", user.id),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 0),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 1),
        ]);
        if (userRes.error)     throw new Error(`User: ${userRes.error.message}`);
        if (ordersRes.error)   throw new Error(`Orders: ${ordersRes.error.message}`);
        if (openRes.error)     throw new Error(`Tickets: ${openRes.error.message}`);
        if (resolvedRes.error) throw new Error(`Resolved: ${resolvedRes.error.message}`);
        setDbUser(userRes.data ?? null);
        setDbPlan(planRes.data ?? null);
        setDbOrders(ordersRes.data ?? []);
        setOpenTickets(openRes.data ?? []);
        setResolvedTickets(resolvedRes.data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").update({ resolved: 1 }).eq("id", ticket.id);
    if (error) { console.error(error.message); return; }
    setOpenTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setResolvedTickets((prev) => [{ ...ticket, resolved: 1 }, ...prev]);
  }

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
      <div className="text-center space-y-1">
        <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
        <p className="text-white/50 text-base">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>

      {/* Modals */}
      {submitOpen && (
        <SubmitTicketModal
          userUuid={dbUser?.user_uuid ?? ""}
          clientName={dbUser?.client_name ?? ""}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={(t) => setOpenTickets((prev) => [t, ...prev])}
        />
      )}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={handleResolve}
        />
      )}
      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
      {teacherModalOpen && dbUser && (
        <CreateTeacherModal enterpriseUuid={dbUser.user_uuid} onClose={() => setTeacherModalOpen(false)} />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        {/* Top row: logo + "Client Dashboard" */}
        <div className="flex items-center gap-4">
          <img src="/fbx_logo.png" alt="FBX Logo" className="max-h-[7vh] max-w-full" />
          <div>
            <h1 className="text-white/75 text-2xl font-bold tracking-wide">Client Dashboard</h1>
          </div>
        </div>
        {/* Second row: personalised portal name */}
        <p className="text-white/35 text-sm font-light tracking-wide">
          {loading ? "Loading portal…" : `${dbUser?.client_name ?? "Enterprise"}'s Portal`}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Robots Shipped", value: String(dbPlan?.robots_shipped ?? 0),         accent: "teal"  as AccentKey },
          { label: "Active Orders",  value: String(dbOrders.length).padStart(2, "0"),     accent: "blue"  as AccentKey },
          { label: "Open Tickets",   value: String(openTickets.length).padStart(2, "0"), accent: "pink"  as AccentKey },
        ].map(({ label, value, accent }) => {
          const a = ACCENTS[accent];
          return (
            <div
              key={label}
              className={`relative rounded-xl bg-[#0d0b1e] border ${a.border} p-5 overflow-hidden hover:border-opacity-60 transition-all duration-200`}
            >
              <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 font-bold mb-3">{label}</p>
              {loading
                ? <div className="h-10 bg-white/5 rounded w-12 animate-pulse" />
                : <p className={`text-4xl font-light ${a.text} tabular-nums`}>{value}</p>
              }
            </div>
          );
        })}
      </div>

      {/* Contract */}
      <SectionCard title="Contract Details" icon={FileText} accent="teal">
        <ContractSection plan={dbPlan} loading={loading} />
      </SectionCard>

      {/* Orders & Tracking */}
      <SectionCard title="Orders & Tracking" icon={Package} count={dbOrders.length} accent="blue">
        <TableHeader cols={["Order", "Tracking", "Status"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : dbOrders.length === 0
          ? <EmptyRow message="No active orders" />
          : dbOrders.map((o) => {
              const status = deriveStatus(o);
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(toModalOrder(o))}
                  className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(o.order_title)} accent="blue" />
                    <div className="min-w-0">
                      <p className="text-white/60 text-sm truncate">{o.order_title}</p>
                      <p className="text-white/25 text-xs">{o.price}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center">
                    {o.tracking_number
                      ? <TrackingCopy value={o.tracking_number} />
                      : <span className="text-white/20 text-xs">—</span>
                    }
                  </div>
                  <div className="flex items-center gap-2 justify-end sm:justify-start">
                    <StatusBadge status={status} />
                    <ExternalLink size={11} className="text-[#629fcc] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })
        }
      </SectionCard>

      {/* Teacher signup */}
      <SectionCard title="Teacher Accounts" icon={UserPlus} accent="teal">
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/45 text-sm">Add a teacher to the curriculum portal.</p>
            <p className="text-white/25 text-xs mt-0.5">Teachers can enroll students into courses.</p>
          </div>
          <button
            onClick={() => setTeacherModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-[#4ecdc4]/15 transition flex-shrink-0"
          >
            <UserPlus size={12} />New Teacher
          </button>
        </div>
      </SectionCard>

      {/* Support */}
      <SectionCard title="Support" icon={TicketCheck} accent="pink">
        <div className="px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-white/45 text-sm">Need help with something?</p>
            <p className="text-white/25 text-xs mt-0.5">We typically respond within 24 hours.</p>
          </div>
          <button
            onClick={() => setSubmitOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c975b9]/10 border border-[#c975b9]/25 text-[#c975b9] text-[10px] uppercase tracking-[0.18em] font-bold hover:bg-[#c975b9]/15 transition flex-shrink-0"
          >
            <TicketCheck size={12} />Open Ticket
          </button>
        </div>
      </SectionCard>

      {/* Open tickets */}
      <SectionCard title="My Tickets" icon={TicketCheck} count={openTickets.length} accent="pink">
        <TableHeader cols={["Title", "Details", "Status"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : openTickets.length === 0
          ? <EmptyRow message="No open tickets" />
          : openTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={getInitials(t.title)} accent="pink" />
                  <p className="text-white/60 text-sm truncate">{t.title}</p>
                </div>
                <p className="hidden sm:block text-white/25 text-xs truncate">{t.ticket_details}</p>
                <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                  <Clock size={10} className="text-[#c975b9]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#c975b9]/60 font-bold">Open</span>
                  <ExternalLink size={11} className="text-[#c975b9] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                </div>
              </div>
            ))
        }
      </SectionCard>

      {/* Resolved tickets */}
      {(loading || resolvedTickets.length > 0) && (
        <SectionCard title="Resolved Tickets" icon={CheckCircle2} count={resolvedTickets.length} accent="slate">
          <TableHeader cols={["Title", "Details", "Status"]} />
          {loading
            ? [1].map((i) => <LoadingRow key={i} />)
            : resolvedTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group opacity-55"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={getInitials(t.title)} accent="slate" />
                    <p className="text-white/35 text-sm truncate line-through">{t.title}</p>
                  </div>
                  <p className="hidden sm:block text-white/15 text-xs truncate">{t.ticket_details}</p>
                  <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                    <CheckCircle2 size={10} className="text-[#91bee3]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#91bee3] font-bold">Resolved</span>
                    <ExternalLink size={11} className="text-[#91bee3] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
                  </div>
                </div>
              ))
          }
        </SectionCard>
      )}
    </div>
  );
}