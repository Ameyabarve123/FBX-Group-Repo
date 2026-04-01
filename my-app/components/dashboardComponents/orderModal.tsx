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
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-white/75 text-3xl font-light tracking-wide">{order.title}</h2>
                {trackingInfo && <StatusBadge status={trackingInfo.status} />}
              </div>
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

            {/* Left: order fields */}
            <div className="flex flex-col gap-9 sm:w-72 flex-shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={15} className="text-[#9b7fe8]" />
                  <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Description</p>
                </div>
                <p className="text-white/50 text-lg leading-relaxed pl-7">{order.description}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={15} className="text-[#e8629a]" />
                  <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Price</p>
                </div>
                <p className="text-white/70 text-lg font-medium pl-7">{order.price}</p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Hash size={15} className="text-[#7e8fb5]" />
                  <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Tracking Number</p>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <p className="text-white/70 text-base font-mono">{order.trackingNumber || "—"}</p>
                  {order.trackingNumber && <CopyButton text={order.trackingNumber} />}
                </div>
              </div>
            </div>

            {/* Right: tracking info */}
            {order.trackingNumber && (
              <div className="flex-1 border-l border-white/[0.06] pl-10">
                <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium mb-5">
                  Shipment Tracking
                </p>

                {/* Loading */}
                {tracking === "loading" && (
                  <div className="flex items-center gap-3 text-white/25 py-4">
                    <Loader2 size={14} className="animate-spin text-[#f59e42]" />
                    <span className="text-xs tracking-widest uppercase">Fetching tracking info…</span>
                  </div>
                )}

                {/* Error */}
                {tracking === "error" && (
                  <div className="flex items-center gap-2 text-[#e8629a]/70 py-4">
                    <AlertCircle size={14} />
                    <span className="text-xs">Could not retrieve tracking information.</span>
                  </div>
                )}

                {/* Tracking data */}
                {trackingInfo && (
                  <div className="space-y-5">
                    {/* Meta row */}
                    <div className="grid grid-cols-3 gap-px bg-white/[0.04]">
                      {[
                        { icon: MapPin, label: "Origin",        val: trackingInfo.origin },
                        { icon: MapPin, label: "Destination",   val: trackingInfo.destination },
                        { icon: Clock,  label: "Est. Delivery", val: trackingInfo.estimatedDelivery ? fmt(trackingInfo.estimatedDelivery) : "—" },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-[#0d0c14] px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon size={10} className="text-[#f59e42]" />
                            <span className="text-[10px] uppercase tracking-[0.18em] text-white/20">{label}</span>
                          </div>
                          <p className="text-white/50 text-sm">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status detail */}
                    <p className="text-white/35 text-sm">{trackingInfo.statusDetail}</p>

                    {/* Timeline */}
                    {trackingInfo.events.length > 0 && (
                      <div className="max-h-60 overflow-y-auto pr-1 space-y-0">
                        {trackingInfo.events.map((ev, i) => (
                          <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                            {i < trackingInfo.events.length - 1 && (
                              <div className="absolute left-[5px] top-3 bottom-0 w-px bg-white/[0.06]" />
                            )}
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-[#0d0c14] ${i === 0 ? "bg-[#f59e42]" : "bg-white/15"}`} />
                            <div className="min-w-0">
                              <p className={`text-sm ${i === 0 ? "text-white/70" : "text-white/35"}`}>{ev.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ev.location  && <span className="text-[11px] text-white/20">{ev.location}</span>}
                                {ev.timestamp && <span className="text-[11px] text-white/15">{fmt(ev.timestamp)}</span>}
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