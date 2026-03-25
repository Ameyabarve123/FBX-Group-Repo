"use client";

import { useEffect } from "react";
import { X, FileText, DollarSign, Hash, MapPin } from "lucide-react";

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

export default function OrderModal({ order, onClose }: OrderModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
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
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center p-8">
      <div
        className="relative w-full max-w-4xl bg-[#0d0c14] border border-white/[0.06]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="px-10 py-8 border-b border-white/[0.06] flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-white/20 font-medium mb-2">
              Order Details
            </p>
            <h2 className="text-white/75 text-3xl font-light tracking-wide">{order.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white/50 transition flex-shrink-0 mt-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-10 py-9 flex flex-col sm:flex-row gap-10">

          {/* Left: fields */}
          <div className="flex flex-col gap-9 sm:w-72 flex-shrink-0">
            {/* Description */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <FileText size={15} className="text-[#9b7fe8]" />
                <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Description</p>
              </div>
              <p className="text-white/50 text-lg leading-relaxed pl-7">{order.description}</p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <DollarSign size={15} className="text-[#e8629a]" />
                <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Price</p>
              </div>
              <p className="text-white/70 text-lg font-medium pl-7">{order.price}</p>
            </div>

            {/* Tracking Number */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Hash size={15} className="text-[#7e8fb5]" />
                <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Tracking Number</p>
              </div>
              <p className="text-white/70 text-lg font-mono pl-7">{order.trackingNumber}</p>
            </div>
          </div>

          {/* Right: map placeholder */}
          <div className="flex-1 min-h-[260px] sm:min-h-0 bg-[#080710] border border-white/[0.04] flex flex-col items-center justify-center gap-4 p-10">
            <MapPin size={24} className="text-white/15" />
            <p className="text-white/20 text-sm tracking-[0.18em] uppercase text-center">
              Tracking API Map with Location
            </p>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-[#9b7fe8] hover:text-[#b8a0f0] underline underline-offset-2 transition"
              >
                Open tracking page ↗
              </a>
            )}
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