"use client";

import { useEffect, useState } from "react";
import {
  X,
  FileText,
  DollarSign,
  Hash,
  MapPin,
  Clock,
  Loader2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface Order {
  title: string;
  description: string;
  price: string;
  trackingNumber: string;
}

interface OrderModalProps {
  order: Order | null;
  onClose: () => void;
}

interface TrackingEvent {
  timestamp: string;
  description: string;
  location: string;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  statusDetail: string;
  estimatedDelivery: string | null;
  origin: string;
  destination: string;
  events: TrackingEvent[];
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

async function fetchTracking(trackingNumber: string): Promise<TrackingInfo> {
  const res = await fetch("/api/fedex/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trackingNumber }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error ?? "Tracking failed");
  }
  return res.json();
}

function fmt(iso: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
    });
  } catch { return iso; }
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    DL: { label: "Delivered",          color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    OD: { label: "Out for Delivery",   color: "text-[#f59e42] bg-[#f59e42]/10 border-[#f59e42]/20" },
    IT: { label: "In Transit",         color: "text-[#9b7fe8] bg-[#9b7fe8]/10 border-[#9b7fe8]/20" },
    PU: { label: "Picked Up",          color: "text-[#7e8fb5] bg-[#7e8fb5]/10 border-[#7e8fb5]/20" },
    DE: { label: "Delivery Exception", color: "text-[#e8629a] bg-[#e8629a]/10 border-[#e8629a]/20" },
    OC: { label: "Label Created",      color: "text-white/40 bg-white/5 border-white/10" },
  };
  const cfg = map[status.toUpperCase()] ?? { label: status, color: "text-white/40 bg-white/5 border-white/10" };
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      onKeyDown={(e) => e.key === "Enter" && navigator.clipboard.writeText(text)}
      className="text-white/20 hover:text-[#f59e42] transition-colors cursor-pointer"
      title="Copy tracking number"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

export default function OrderModal({ order, onClose }: OrderModalProps) {
  const [tracking, setTracking] = useState<TrackingInfo | "loading" | "error" | null>(null);

  // Keyboard + scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Auto-fetch tracking when modal opens (if tracking number exists)
  useEffect(() => {
    if (!order?.trackingNumber) return;
    setTracking("loading");
    fetchTracking(order.trackingNumber)
      .then((info) => setTracking(info))
      .catch(() => setTracking("error"));
  }, [order?.trackingNumber]);

  if (!order) return null;

  const trackingInfo = tracking && tracking !== "loading" && tracking !== "error"
    ? (tracking as TrackingInfo)
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70" onClick={onClose}>
      <div className="flex min-h-full items-end sm:items-center justify-center sm:p-8">
        <div
          className="relative w-full sm:max-w-4xl bg-[#0d0c14] border-t sm:border border-white/[0.06] sm:mb-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="px-5 sm:px-10 py-5 sm:py-8 border-b border-white/[0.06] flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-white/20 font-medium mb-1.5 sm:mb-2">
                Order Details
              </p>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <h2 className="text-white/75 text-xl sm:text-3xl font-light tracking-wide truncate">{order.title}</h2>
                {trackingInfo && <StatusBadge status={trackingInfo.status} />}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-white/20 hover:text-white/50 transition flex-shrink-0 mt-0.5"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-5 sm:px-10 py-6 sm:py-9 flex flex-col gap-6 sm:gap-10 sm:flex-row">

            {/* Order fields — horizontal pills on mobile, vertical stack on desktop */}
            <div className="flex flex-col gap-5 sm:gap-9 sm:w-72 sm:flex-shrink-0">

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <FileText size={13} className="text-[#9b7fe8]" />
                  <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Description</p>
                </div>
                <p className="text-white/50 text-sm sm:text-lg leading-relaxed pl-5 sm:pl-7">{order.description}</p>
              </div>

              {/* Price + Tracking — side by side on mobile */}
              <div className="grid grid-cols-2 gap-4 sm:contents">
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <DollarSign size={13} className="text-[#e8629a]" />
                    <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Price</p>
                  </div>
                  <p className="text-white/70 text-sm sm:text-lg font-medium sm:pl-7">{order.price}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <Hash size={13} className="text-[#7e8fb5]" />
                    <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Tracking</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:pl-7">
                    <p className="text-white/70 text-xs sm:text-base font-mono truncate">{order.trackingNumber || "—"}</p>
                    {order.trackingNumber && <CopyButton text={order.trackingNumber} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking info */}
            {order.trackingNumber && (
              <div className="sm:flex-1 sm:border-l border-t sm:border-t-0 border-white/[0.06] pt-5 sm:pt-0 sm:pl-10">
                <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/20 font-medium mb-4 sm:mb-5">
                  Shipment Tracking
                </p>

                {tracking === "loading" && (
                  <div className="flex items-center gap-3 text-white/25 py-3">
                    <Loader2 size={13} className="animate-spin text-[#f59e42]" />
                    <span className="text-xs tracking-widest uppercase">Fetching tracking info…</span>
                  </div>
                )}

                {tracking === "error" && (
                  <div className="flex items-center gap-2 text-[#e8629a]/70 py-3">
                    <AlertCircle size={13} />
                    <span className="text-xs">Could not retrieve tracking information.</span>
                  </div>
                )}

                {trackingInfo && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Meta row — 3 cols on desktop, 1 row scroll on mobile */}
                    <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
                      {[
                        { icon: MapPin, label: "Origin",        val: trackingInfo.origin },
                        { icon: MapPin, label: "Destination",   val: trackingInfo.destination },
                        { icon: Clock,  label: "Est. Delivery", val: trackingInfo.estimatedDelivery ? fmt(trackingInfo.estimatedDelivery) : "—" },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-[#0d0c14] px-3 sm:px-4 py-2.5 sm:py-3">
                          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
                            <Icon size={9} className="text-[#f59e42]" />
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-white/20">{label}</span>
                          </div>
                          <p className="text-white/50 text-xs sm:text-sm truncate">{val}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-white/35 text-xs sm:text-sm">{trackingInfo.statusDetail}</p>

                    {/* Timeline */}
                    {trackingInfo.events.length > 0 && (
                      <div className="max-h-48 sm:max-h-60 overflow-y-auto pr-1 space-y-0">
                        {trackingInfo.events.map((ev, i) => (
                          <div key={i} className="flex gap-3 pb-3 sm:pb-4 last:pb-0 relative">
                            {i < trackingInfo.events.length - 1 && (
                              <div className="absolute left-[5px] top-3 bottom-0 w-px bg-white/[0.06]" />
                            )}
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-[#0d0c14] ${i === 0 ? "bg-[#f59e42]" : "bg-white/15"}`} />
                            <div className="min-w-0">
                              <p className={`text-xs sm:text-sm ${i === 0 ? "text-white/70" : "text-white/35"}`}>{ev.description}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {ev.location  && <span className="text-[10px] sm:text-[11px] text-white/20">{ev.location}</span>}
                                {ev.timestamp && <span className="text-[10px] sm:text-[11px] text-white/15">{fmt(ev.timestamp)}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-5 sm:px-10 pb-6 sm:pb-10 border-t border-white/[0.06] pt-4 sm:pt-6">
            <button
              onClick={onClose}
              className="w-full py-3 sm:py-4 text-white/30 text-xs sm:text-sm uppercase tracking-[0.2em] hover:text-white/60 hover:bg-white/[0.02] border border-white/[0.06] transition-colors duration-150"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}