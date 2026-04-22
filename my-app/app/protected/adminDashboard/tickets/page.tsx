"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TicketCheck, ExternalLink, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar, SectionCard, TableHeader, LoadingRow, EmptyRow,
  getInitials, PAGE_BG,
} from "../components";

import TicketModal from "@/components/dashboardComponents/ticketModal";
import type { DBTicket } from "@/components/dashboardComponents/types";

export default function TicketsPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [dbTickets, setDbTickets] = useState<DBTicket[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<DBTicket | null>(null);

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
        const { data, error } = await supabase
          .from("tickets").select("*").eq("resolved", 0);
        if (error) throw new Error(error.message);
        setDbTickets(data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase
      .from("tickets").update({ resolved: 1 }).eq("id", ticket.id);
    if (error) { console.error("Failed to resolve ticket:", error.message); return; }
    setDbTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setSelectedTicket(null);
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

      {selectedTicket && (
        <TicketModal
          ticket={{
            title:   selectedTicket.title,
            name:    selectedTicket.client_name,
            contact: selectedTicket.contact_details,
            details: selectedTicket.ticket_details,
          }}
          onClose={() => setSelectedTicket(null)}
          onResolve={() => handleResolve(selectedTicket)}
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
        <h1 className="text-white/100 text-2xl font-bold tracking-wide">Support Tickets</h1>
      </div>

      <SectionCard title="Support Tickets" icon={TicketCheck} count={dbTickets.length} accent="pink">
        <TableHeader cols={["Profile", "Client", "Title"]} />
        {loading
          ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
          : dbTickets.length === 0
          ? <EmptyRow message="No open tickets" />
          : dbTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
              >
                <Avatar initials={getInitials(t.client_name)} color="pink" />
                <span className="text-white/100 text-sm truncate">{t.client_name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/100 truncate hidden sm:block">{t.title}</span>
                  <ExternalLink size={11} className="text-[#FF6996] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
      </SectionCard>
    </div>
  );
}