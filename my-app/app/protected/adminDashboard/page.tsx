"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShoppingCart,
  TicketCheck,
  ExternalLink,
  GraduationCap,
  Plus,
  Copy,
  Check,
  LucideIcon,
} from "lucide-react";
import TicketModal from "@/components/dashboardComponents/ticketModal";
import PlanModal from "@/components/dashboardComponents/planModal";
import OrderModal from "@/components/dashboardComponents/orderModal";
import { createClient } from "@/lib/supabase/client";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface DBUser {
  id: string;
  client_name: string;
  is_admin: boolean;
  user_uuid: string;
  role: number;
}

interface DBTicket {
  id: string;
  title: string;
  contact_details: string;
  ticket_details: string;
  client_name: string;
  user_uuid: string;
}

interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
}

interface DBPlan {
  id: string;
  plan_title: string;
  description: string;
  price: string;
  user_uuid: string;
}

interface AvatarProps {
  initials: string;
  color?: "pink" | "violet" | "slate";
}

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  children: React.ReactNode;
  accent?: "pink" | "violet" | "slate";
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const ACCENTS = {
  pink:   { text: "text-[#e8629a]", bg: "bg-[#e8629a]/10", border: "border-[#e8629a]/20", hex: "#e8629a" },
  violet: { text: "text-[#9b7fe8]", bg: "bg-[#9b7fe8]/10", border: "border-[#9b7fe8]/20", hex: "#9b7fe8" },
  slate:  { text: "text-[#7e8fb5]", bg: "bg-[#7e8fb5]/10", border: "border-[#7e8fb5]/20", hex: "#7e8fb5" },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Avatar({ initials, color = "pink" }: AvatarProps) {
  const styles = {
    pink:   "bg-[#e8629a]/10 text-[#e8629a] ring-1 ring-[#e8629a]/25",
    violet: "bg-[#9b7fe8]/10 text-[#9b7fe8] ring-1 ring-[#9b7fe8]/25",
    slate:  "bg-[#7e8fb5]/10 text-[#7e8fb5] ring-1 ring-[#7e8fb5]/25",
  };
  return (
    <div className={`w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${styles[color]}`}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, accent = "violet" }: { label: string; value: string; accent?: "pink" | "violet" | "slate" }) {
  const a = ACCENTS[accent];
  return (
    <div className="relative bg-[#0d0c14] border border-white/[0.06] p-5 overflow-hidden hover:border-white/10 transition-colors duration-300">
      <div className={`absolute inset-x-0 top-0 h-px ${a.bg}`} />
      <p className="text-xs uppercase tracking-[0.18em] text-white/25 font-medium mb-3">{label}</p>
      <p className={`text-4xl font-light ${a.text} tabular-nums`}>{value}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, count, children, accent = "violet" }: SectionCardProps) {
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
  return (
    <div className="px-5 py-8 text-center text-white/15 text-xs tracking-[0.18em] uppercase">
      {message}
    </div>
  );
}

// ─── COPY FIELD ───────────────────────────────────────────────────────────────

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{label}</p>
      <div className="flex items-center justify-between gap-3 bg-[#080710] border border-white/[0.06] px-4 py-3">
        <span className="text-sm text-white/60 font-mono truncate">{value}</span>
        <button onClick={handleCopy} className="flex-shrink-0 text-white/20 hover:text-[#9b7fe8] transition-colors">
          {copied ? <Check size={13} className="text-[#9b7fe8]" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

// ─── CREDENTIALS MODAL ────────────────────────────────────────────────────────

function CredentialsModal({
  name, email, password, onClose,
}: {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">

        <div className="flex items-center gap-3">
          <GraduationCap size={14} className="text-[#9b7fe8]" />
          <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Teacher Account Created</span>
        </div>

        <p className="text-white/25 text-xs leading-relaxed">
          Share these credentials with the teacher. The password will not be shown again.
        </p>

        <div className="space-y-3">
          <CopyField label="Name"     value={name}     />
          <CopyField label="Email"    value={email}    />
          <CopyField label="Password" value={password} />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── CREATE TEACHER MODAL ─────────────────────────────────────────────────────

function CreateTeacherModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (name: string, email: string, password: string) => void;
}) {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState(generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [err,        setErr]        = useState<string | null>(null);

  async function handleCreate() {
    if (!name || !email || !password) return;
    setSubmitting(true);
    setErr(null);

    try {
      // Create the auth user via your API route (needs service-role key)
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error ?? "Failed to create account");
      }

      onCreated(name, email, password);
      onClose();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap size={14} className="text-[#9b7fe8]" />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Create Teacher Account</span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition text-lg leading-none">×</button>
        </div>

        <div className="space-y-3">
          {[
            { label: "Client Name",  value: name,     setter: setName,     placeholder: "e.g. Jane Smith",        type: "text"     },
            { label: "Email",      value: email,    setter: setEmail,    placeholder: "e.g. jane@school.com",   type: "email"    },
            { label: "Password",   value: password, setter: setPassword, placeholder: "Auto-generated",         type: "text"     },
          ].map(({ label, value, setter, placeholder, type }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{label}</p>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 placeholder:text-white/15 outline-none focus:border-white/10 transition font-mono"
              />
            </div>
          ))}
          {err && <p className="text-[#e8629a] text-xs">{err}</p>}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setPassword(generatePassword())}
            className="text-[10px] uppercase tracking-[0.18em] text-white/20 hover:text-white/40 transition px-3 py-2 border border-white/[0.06] hover:border-white/10"
          >
            Regenerate
          </button>
          <button onClick={onClose} className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || !email || !password || submitting}
            className="flex-1 py-2.5 bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-xs uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────

export default function AdminHomepage() {
  const supabase = createClient();

  const [dbUsers,   setDbUsers]   = useState<DBUser[]>([]);
  const [dbTickets, setDbTickets] = useState<DBTicket[]>([]);
  const [dbOrders,  setDbOrders]  = useState<DBOrder[]>([]);
  const [dbPlans,   setDbPlans]   = useState<DBPlan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [selectedTicket, setSelectedTicket] = useState<DBTicket | null>(null);
  const [selectedPlan,   setSelectedPlan]   = useState<DBPlan | null>(null);
  const [selectedOrder,  setSelectedOrder]  = useState<DBOrder | null>(null);

  const [createTeacherOpen, setCreateTeacherOpen] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ name: string; email: string; password: string } | null>(null);

  // Derived: teachers are users with role === 0
  const teachers = dbUsers.filter((u) => u.role === 0);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data: adminCheck, error: adminError } = await supabase
        .from("users").select("is_admin").eq("user_uuid", user.id).single();
      if (adminError || !adminCheck || adminCheck.is_admin !== 1) {
        setError("Access denied"); setLoading(false); return;
      }

      try {
        const [usersRes, ticketsRes, ordersRes, plansRes] = await Promise.all([
          supabase.from("users").select("*").eq('role', 0),
          supabase.from("tickets").select("*"),
          supabase.from("orders").select("*"),
          supabase.from("plans").select("*"),
        ]);
        if (usersRes.error)   throw new Error(`Users: ${usersRes.error.message}`);
        if (ticketsRes.error) throw new Error(`Tickets: ${ticketsRes.error.message}`);
        if (ordersRes.error)  throw new Error(`Orders: ${ordersRes.error.message}`);
        if (plansRes.error)   throw new Error(`Plans: ${plansRes.error.message}`);

        setDbUsers(usersRes.data   ?? []);
        setDbTickets(ticketsRes.data ?? []);
        setDbOrders(ordersRes.data  ?? []);
        setDbPlans(plansRes.data    ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  function getPlanForUser(userUuid: string): DBPlan | undefined {
    return dbPlans.find((p) => p.user_uuid === userUuid);
  }

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
    if (error) { console.error("Failed to resolve ticket:", error.message); return; }
    setDbTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setSelectedTicket(null);
  }

  function handleTeacherCreated(name: string, email: string, password: string) {
    setNewCredentials({ name, email, password });
  }

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

      {/* Modals */}
      {selectedTicket && (
        <TicketModal
          ticket={{ title: selectedTicket.title, name: selectedTicket.client_name, contact: selectedTicket.contact_details, details: selectedTicket.ticket_details }}
          onClose={() => setSelectedTicket(null)}
          onResolve={() => handleResolve(selectedTicket)}
        />
      )}
      {selectedPlan && (
        <PlanModal
          plan={{ title: selectedPlan.plan_title, description: selectedPlan.description, price: selectedPlan.price }}
          onClose={() => setSelectedPlan(null)}
        />
      )}
      {selectedOrder && (
        <OrderModal
          order={{ title: selectedOrder.order_title, description: selectedOrder.description, price: selectedOrder.price, trackingNumber: selectedOrder.tracking_number }}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {createTeacherOpen && (
        <CreateTeacherModal
          onClose={() => setCreateTeacherOpen(false)}
          onCreated={handleTeacherCreated}
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

      {/* Page header */}
      <div className="pb-4 border-b border-white/[0.06]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/20 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-light tracking-wide">Admin Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
        <StatCard label="Customers"    value={String(dbUsers.length).padStart(2, "0")}   accent="violet" />
        <StatCard label="Open Tickets" value={String(dbTickets.length).padStart(2, "0")} accent="pink"   />
        <StatCard label="Orders"       value={String(dbOrders.length).padStart(2, "0")}  accent="slate"  />
      </div>

      {/* Customers */}
      <SectionCard title="Customers" icon={Users} count={dbUsers.length} accent="violet">
        <TableHeader cols={["Profile", "Name", "Plan"]} />
        {loading ? [1,2,3].map(i => <LoadingRow key={i} />) :
         dbUsers.length === 0 ? <EmptyRow message="No customers" /> :
         dbUsers.map((u) => {
           const plan = getPlanForUser(u.user_uuid);
           return (
             <div key={u.id} onClick={() => plan && setSelectedPlan(plan)}
               className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group">
               <Avatar initials={getInitials(u.client_name)} color="violet" />
               <div className="flex items-center gap-2 min-w-0">
                 <span className="text-white/60 text-sm truncate">{u.client_name}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 {plan
                   ? <><span className="text-sm text-white/35 truncate">{plan.plan_title}</span>
                       <ExternalLink size={11} className="text-[#9b7fe8] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" /></>
                   : <span className="text-sm text-white/15">—</span>}
               </div>
             </div>
           );
         })}
      </SectionCard>

      {/* Tickets */}
      <SectionCard title="Support Tickets" icon={TicketCheck} count={dbTickets.length} accent="pink">
        <TableHeader cols={["Profile", "Client", "Title"]} />
        {loading ? [1,2].map(i => <LoadingRow key={i} />) :
         dbTickets.length === 0 ? <EmptyRow message="No open tickets" /> :
         dbTickets.map((t) => (
           <div key={t.id} onClick={() => setSelectedTicket(t)}
             className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group">
             <Avatar initials={getInitials(t.client_name)} color="pink" />
             <span className="text-white/60 text-sm truncate">{t.client_name}</span>
             <div className="flex items-center gap-1.5">
               <span className="text-sm text-white/35 truncate hidden sm:block">{t.title}</span>
               <ExternalLink size={11} className="text-[#e8629a] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
           </div>
         ))}
      </SectionCard>

      {/* Orders */}
      <SectionCard title="Orders in Progress" icon={ShoppingCart} count={dbOrders.length} accent="slate">
        <TableHeader cols={["Profile", "Order", "Price"]} />
        {loading ? [1,2].map(i => <LoadingRow key={i} />) :
         dbOrders.length === 0 ? <EmptyRow message="No active orders" /> :
         dbOrders.map((o) => {
           const owner = dbUsers.find((u) => u.user_uuid === o.user_uuid);
           return (
             <div key={o.id} onClick={() => setSelectedOrder(o)}
               className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group">
               <Avatar initials={getInitials(owner?.client_name ?? "?")} color="slate" />
               <span className="text-white/60 text-sm truncate">{o.order_title}</span>
               <div className="flex items-center gap-1.5">
                 <span className="text-sm text-white/35">{o.price}</span>
                 <ExternalLink size={11} className="text-[#7e8fb5] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             </div>
           );
         })}
      </SectionCard>

      {/* Teachers */}
      <SectionCard title="Teachers" icon={GraduationCap} count={teachers.length} accent="violet">
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.04]">
          <button
            onClick={() => setCreateTeacherOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#9b7fe8]/10 border border-[#9b7fe8]/20 text-[#9b7fe8] text-[10px] uppercase tracking-[0.18em] hover:bg-[#9b7fe8]/15 transition flex-shrink-0"
          >
            <Plus size={12} />
            New Teacher
          </button>
        </div>
        <TableHeader cols={["Profile", "Name", "Role"]} />
        {loading ? [1, 2].map(i => <LoadingRow key={i} />) :
         teachers.length === 0 ? <EmptyRow message="No teacher accounts" /> :
         teachers.map((u) => (
           <div key={u.id}
             className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0">
             <Avatar initials={getInitials(u.client_name)} color="violet" />
             <span className="text-white/60 text-sm truncate">{u.client_name}</span>
             <span className="text-[10px] uppercase tracking-widest text-[#9b7fe8] bg-[#9b7fe8]/10 px-2 py-0.5 border border-[#9b7fe8]/20 w-fit">
               Teacher
             </span>
           </div>
         ))}
      </SectionCard>

    </div>
  );
}