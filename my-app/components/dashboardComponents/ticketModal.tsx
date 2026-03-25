"use client";

import { useEffect } from "react";
import { X, CheckCircle, User, Phone, FileText } from "lucide-react";

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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-8">
      <div
        className="relative w-full max-w-2xl bg-[#0d0c14] border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-10 py-8 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/20 font-medium mb-2">
              Support Ticket
            </p>
            <h2 className="text-white/75 text-3xl font-light tracking-wide">{ticket.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white/50 transition flex-shrink-0 mt-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Fields ── */}
        <div className="px-10 py-9 space-y-9">
          {/* Name */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <User size={15} className="text-[#e8629a]" />
              <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Name</p>
            </div>
            <p className="text-white/60 text-lg pl-7">{ticket.name}</p>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Phone size={15} className="text-[#9b7fe8]" />
              <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Contact</p>
            </div>
            <p className="text-white/60 text-lg pl-7">{ticket.contact}</p>
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FileText size={15} className="text-[#7e8fb5]" />
              <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Details</p>
            </div>
            <p className="text-white/50 text-lg leading-relaxed pl-7">{ticket.details}</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-10 pb-10 border-t border-white/[0.06] pt-6 flex gap-4">
          <button
            onClick={() => { onResolve(ticket); onClose(); }}
            className="flex-1 flex items-center justify-center gap-2.5 py-4 bg-[#e8629a]/10 hover:bg-[#e8629a]/15 text-[#e8629a] text-sm uppercase tracking-[0.2em] border border-[#e8629a]/20 hover:border-[#e8629a]/30 transition-colors duration-150"
          >
            <CheckCircle size={16} />
            Resolve
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-4 text-white/30 text-sm uppercase tracking-[0.2em] hover:text-white/60 hover:bg-white/[0.02] border border-white/[0.06] transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}