"use client";

import { useEffect } from "react";
import { X, FileText, DollarSign } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  title: string;
  description: string;
  price: string;
}

interface PlanModalProps {
  plan: Plan | null;
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function PlanModal({ plan, onClose }: PlanModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!plan) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#1e1c2e] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8b8099] font-semibold mb-1">
              Plan Details
            </p>
            <h2 className="text-[#e8e0ee] text-xl font-bold tracking-wide">{plan.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8b8099] hover:text-[#e8e0ee] hover:bg-white/5 transition flex-shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Fields ── */}
        <div className="px-6 py-5 space-y-4">
          {/* Description */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#7B93F9]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={14} className="text-[#7B93F9]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#4a4560] font-bold mb-0.5">
                Description
              </p>
              <p className="text-[#c4b8d4] text-sm leading-relaxed">{plan.description}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#F97B8B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <DollarSign size={14} className="text-[#F97B8B]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-[#4a4560] font-bold mb-0.5">
                Price
              </p>
              <p className="text-[#e8e0ee] text-sm font-semibold">{plan.price}</p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#e8e0ee] text-sm font-semibold tracking-wide transition-all duration-200 border border-white/10"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}