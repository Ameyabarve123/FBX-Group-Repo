"use client";

import { useEffect } from "react";
import { X, CheckCircle, User, Phone, FileText, TicketCheck } from "lucide-react";

interface Ticket {
  title: string;
  name: string;
  contact: string;
  details: string;
}

interface TicketModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onResolve: (ticket: Ticket) => void;
}

export default function TicketModal({ ticket, onClose, onResolve }: TicketModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!ticket) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-8">
        <div
          className="relative w-full max-w-2xl bg-[#0d0b1e] border border-white/[0.125] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Header ── */}
          <div className="px-10 py-8 border-b border-white/[0.125] flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/100 mb-2">
                Support Ticket
              </p>
              <h2 className="text-white/100 text-3xl font-bold tracking-wide">
                {ticket.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-white/100 hover:text-white/100 transition mt-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-10 py-9 space-y-8">

            {/* Name */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <User size={15} className="text-[#FF6996]" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Name</p>
              </div>
              <p className="text-white/100 text-base leading-relaxed pl-7">{ticket.name}</p>
            </div>

            {/* Contact */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Phone size={15} className="text-[#629fcc]" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Contact</p>
              </div>
              <p className="text-white/100 text-base leading-relaxed pl-7">{ticket.contact}</p>
            </div>

            {/* Details */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FileText size={15} className="text-[#91bee3]" />
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Details</p>
              </div>
              <p className="text-white/100 text-base leading-relaxed pl-7">{ticket.details}</p>
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="px-10 pb-10 border-t border-white/[0.125] pt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg text-white/100 text-xs font-bold uppercase tracking-[0.2em] hover:text-white/100 border border-white/[0.08] hover:border-white/[0.14] transition"
            >
              Close
            </button>
            <button
              onClick={() => { onResolve(ticket); onClose(); }}
              className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 bg-[#FF6996]/10 border border-[#FF6996]/20 text-[#FF6996] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#FF6996]/15 transition"
            >
              <CheckCircle size={12} />
              Resolve Ticket
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}