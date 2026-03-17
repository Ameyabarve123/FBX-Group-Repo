"use client";

import { useEffect } from "react";
import { X, FileText, DollarSign, Hash, MapPin } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  title: string;
  description: string;
  price: string;
  trackingNumber: string;
  trackingUrl?: string;
}

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export default function OrderModal({ order, onClose }: OrderModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-[#1e1c2e] border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#8b8099] font-semibold mb-1">
              Order Details
            </p>
            <h2 className="text-[#e8e0ee] text-xl font-bold tracking-wide">{order.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8b8099] hover:text-[#e8e0ee] hover:bg-white/5 transition flex-shrink-0 mt-0.5"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Body — two column layout ── */}
        <div className="px-6 py-5 flex flex-col sm:flex-row gap-5">

          {/* Left: fields */}
          <div className="flex flex-col gap-4 sm:w-52 flex-shrink-0">
            {/* Description */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#7B93F9]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FileText size={14} className="text-[#7B93F9]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-[#4a4560] font-bold mb-0.5">
                  Description
                </p>
                <p className="text-[#c4b8d4] text-sm leading-relaxed">{order.description}</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F97B8B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <DollarSign size={14} className="text-[#F97B8B]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-[#4a4560] font-bold mb-0.5">
                  Price
                </p>
                <p className="text-[#e8e0ee] text-sm font-semibold">{order.price}</p>
              </div>
            </div>

            {/* Tracking Number */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B7B8F]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Hash size={14} className="text-[#8B7B8F]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-[#4a4560] font-bold mb-0.5">
                  Tracking Number
                </p>
                <p className="text-[#e8e0ee] text-sm font-mono">{order.trackingNumber}</p>
              </div>
            </div>
          </div>

          {/* Right: map placeholder */}
          <div className="flex-1 min-h-[200px] sm:min-h-0 rounded-xl bg-[#F97B8B]/5 border border-[#F97B8B]/10 flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-10 h-10 rounded-xl bg-[#F97B8B]/15 flex items-center justify-center">
              <MapPin size={20} className="text-[#F97B8B]" />
            </div>
            <p className="text-[#8b8099] text-sm font-medium text-center">
              Tracking API Map with Location
            </p>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#7B93F9] hover:text-[#a0b0fb] underline underline-offset-2 transition"
              >
                Open tracking page ↗
              </a>
            )}
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