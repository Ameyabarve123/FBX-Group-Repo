"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  TicketCheck,
  ExternalLink,
  ArrowLeft,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { DBTicket } from "@/components/dashboardComponents/types";

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

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ initials, accent }: { initials: string; accent: AccentKey }) {
  const a = ACCENTS[accent];
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${a.bg} ${a.text} ring-1 ${a.border}`}>
      {initials}
    </div>
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

// Submit Ticket Modal
function SubmitTicketModal({ userUuid, clientName, onClose, onSubmitted }: {
  userUuid: string; clientName: string; onClose: () => void; onSubmitted: (t: DBTicket) => void;
}) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [contact, setContact] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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
        <p className="text-white/25 text-xs">We'll get back to you within 24 hours.</p>
        <button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg border border-white/[0.08] text-white/40 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/15 hover:text-white/60 transition">Done</button>
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
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/30 text-xs uppercase tracking-[0.18em] font-bold hover:border-white/[0.14] hover:text-white/50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!title || !details || submitting} className="flex-1 py-2.5 rounded-lg bg-[#c975b9]/10 border border-[#c975b9]/25 text-[#c975b9] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#c975b9]/15 transition disabled:opacity-30 disabled:cursor-not-allowed">
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Ticket Detail Modal with Delete
function TicketDetailModal({ ticket, onClose, onResolve, onDelete }: {
  ticket: DBTicket; onClose: () => void;
  onResolve: (t: DBTicket) => Promise<void>;
  onDelete: (t: DBTicket) => Promise<void>;
}) {
  const [working, setWorking] = useState<"resolve" | "delete" | null>(null);
  const isResolved = ticket.resolved === 1;

  async function handle(action: "resolve" | "delete") {
    setWorking(action);
    if (action === "resolve") await onResolve(ticket);
    if (action === "delete") await onDelete(ticket);
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
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Title</p><p className="text-white/70 text-sm">{ticket.title}</p></div>
          {ticket.contact_details && <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Contact</p><p className="text-white/45 text-sm">{ticket.contact_details}</p></div>}
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Details</p><p className="text-white/45 text-sm leading-relaxed">{ticket.ticket_details}</p></div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 font-bold mb-1">Status</p>
            {isResolved
              ? <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#91bee3]"><CheckCircle2 size={10} /> Resolved</span>
              : <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#c975b9]"><Clock size={10} /> Open</span>
            }
          </div>
        </div>
        <div className="flex gap-3 pt-1">
          {isResolved && (
            <button onClick={() => handle("delete")} disabled={!!working}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg border border-white/[0.08] text-white/30 text-xs uppercase tracking-[0.18em] font-bold hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <Trash2 size={11} />{working === "delete" ? "Deleting…" : "Delete"}
            </button>
          )}
          {!isResolved && (
            <button onClick={() => handle("resolve")} disabled={!!working}
              className="flex items-center justify-center gap-1.5 flex-1 py-2.5 rounded-lg bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-xs uppercase tracking-[0.18em] font-bold hover:bg-[#629fcc]/15 transition disabled:opacity-30 disabled:cursor-not-allowed">
              <CheckCircle2 size={11} />{working === "resolve" ? "Resolving…" : "Resolve"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const action = searchParams?.get("action");

  const [dbUser, setDbUser] = useState<{ user_uuid: string; client_name: string } | null>(null);
  const [openTickets, setOpenTickets] = useState<DBTicket[]>([]);
  const [resolvedTickets, setResolvedTickets] = useState<DBTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DBTicket | null>(null);
  const [submitOpen, setSubmitOpen] = useState(action === "new");

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      try {
        const [userRes, openRes, resolvedRes] = await Promise.all([
          supabase.from("users").select("user_uuid, client_name").eq("user_uuid", user.id).single(),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 0),
          supabase.from("tickets").select("*").eq("user_uuid", user.id).eq("resolved", 1),
        ]);
        if (userRes.error) throw new Error(userRes.error.message);
        if (openRes.error) throw new Error(openRes.error.message);
        if (resolvedRes.error) throw new Error(resolvedRes.error.message);
        setDbUser(userRes.data);
        setOpenTickets(openRes.data ?? []);
        setResolvedTickets(resolvedRes.data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [supabase]);

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").update({ resolved: 1 }).eq("id", ticket.id);
    if (error) { console.error(error.message); return; }
    setOpenTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setResolvedTickets((prev) => [{ ...ticket, resolved: 1 }, ...prev]);
  }

  async function handleDelete(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
    if (error) { console.error(error.message); return; }
    setResolvedTickets((prev) => prev.filter((t) => t.id !== ticket.id));
  }

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
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>
      
      {submitOpen && dbUser && (
        <SubmitTicketModal
          userUuid={dbUser.user_uuid}
          clientName={dbUser.client_name}
          onClose={() => setSubmitOpen(false)}
          onSubmitted={(t) => setOpenTickets((prev) => [t, ...prev])}
        />
      )}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onResolve={handleResolve}
          onDelete={handleDelete}
        />
      )}

      {/* Header - matching client dashboard */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/protected/clientDashboard")}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-[10px] font-bold uppercase tracking-[0.18em] transition"
          >
            <ArrowLeft size={11} />Back
          </button>
        </div>
        <div>
          <h1 className="text-white/75 text-2xl font-bold tracking-wide">Support Tickets</h1>
          <p className="text-white/35 text-sm font-light tracking-wide mt-1">Manage your support requests</p>
        </div>
      </div>

      {/* New Ticket Button */}
      <div>
        <button
          onClick={() => setSubmitOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c975b9]/10 border border-[#c975b9]/25 text-[#c975b9] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#c975b9]/15 transition"
        >
          <Plus size={12} />New Ticket
        </button>
      </div>

      {/* Open Tickets */}
      <div className={`rounded-xl bg-[#0d0b1e] border ${ACCENTS.pink.border} overflow-hidden`}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${ACCENTS.pink.bg} flex items-center justify-center`}>
              <TicketCheck size={14} className={ACCENTS.pink.text} />
            </div>
            <h2 className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Open Tickets</h2>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${ACCENTS.pink.bg} ${ACCENTS.pink.text} tracking-wider`}>
            {String(openTickets.length).padStart(2, "0")}
          </span>
        </div>

        <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.06]" style={{ gridTemplateColumns: "1.5fr 2fr 1fr" }}>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Title</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Details</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Status</span>
        </div>

        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/3" />
                <div className="h-2.5 bg-white/5 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : openTickets.length === 0 ? (
          <div className="px-5 py-8 text-center text-white/20 text-xs tracking-[0.18em] uppercase">No open tickets</div>
        ) : (
          openTickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <Avatar initials={getInitials(t.title)} accent="pink" />
                <p className="text-white/60 text-sm truncate">{t.title}</p>
              </div>
              <p className="hidden sm:block text-white/30 text-xs truncate">{t.ticket_details}</p>
              <div className="flex items-center gap-1.5 justify-end sm:justify-start">
                <Clock size={10} className="text-[#c975b9]" />
                <span className="text-[10px] uppercase tracking-widest text-[#c975b9]/70 font-bold">Open</span>
                <ExternalLink size={11} className="text-[#c975b9] opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolved Tickets */}
      {(loading || resolvedTickets.length > 0) && (
        <div className={`rounded-xl bg-[#0d0b1e] border ${ACCENTS.slate.border} overflow-hidden`}>
          <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg ${ACCENTS.slate.bg} flex items-center justify-center`}>
                <CheckCircle2 size={14} className={ACCENTS.slate.text} />
              </div>
              <h2 className="text-white/55 text-xs uppercase tracking-[0.18em] font-bold">Resolved Tickets</h2>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${ACCENTS.slate.bg} ${ACCENTS.slate.text} tracking-wider`}>
              {String(resolvedTickets.length).padStart(2, "0")}
            </span>
          </div>

          <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.06]" style={{ gridTemplateColumns: "1.5fr 2fr 1fr" }}>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Title</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Details</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/25 font-bold">Status</span>
          </div>

          {loading ? (
            <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-white/5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/5 rounded w-1/3" />
              </div>
            </div>
          ) : resolvedTickets.length === 0 ? (
            <div className="px-5 py-8 text-center text-white/20 text-xs tracking-[0.18em] uppercase">No resolved tickets</div>
          ) : (
            resolvedTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group opacity-60"
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
          )}
        </div>
      )}
    </div>
  );
}