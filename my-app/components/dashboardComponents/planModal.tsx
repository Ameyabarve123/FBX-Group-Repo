"use client";

import { useEffect } from "react";
import { X, FileText, DollarSign } from "lucide-react";

interface Plan {
  title: string;
  description: string;
  price: string;
}

interface PlanModalProps {
  plan: Plan | null;
  onClose: () => void;
}

export default function PlanModal({ plan, onClose }: PlanModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!plan) return null;

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
              Plan Details
            </p>
            <h2 className="text-white/75 text-3xl font-light tracking-wide">{plan.title}</h2>
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
          {/* Description */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <FileText size={15} className="text-[#9b7fe8]" />
              <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Description</p>
            </div>
            <p className="text-white/50 text-lg leading-relaxed pl-7">{plan.description}</p>
          </div>

          {/* Price */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <DollarSign size={15} className="text-[#e8629a]" />
              <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Price</p>
            </div>
            <p className="text-white/70 text-lg font-medium pl-7">{plan.price}</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-10 pb-10 border-t border-white/[0.06] pt-6">
          <button
            onClick={onClose}
            className="w-full py-4 text-white/30 text-sm uppercase tracking-[0.2em] hover:text-white/60 hover:bg-white/[0.02] border border-white/[0.06] transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}