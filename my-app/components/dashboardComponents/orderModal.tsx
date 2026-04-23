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

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      onKeyDown={(e) => e.key === "Enter" && navigator.clipboard.writeText(text)}
      className="text-white/100 hover:text-[#91bee3] transition-colors cursor-pointer"
      title="Copy tracking number"
    >
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </span>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

export default function OrderModal({ order, onClose }: OrderModalProps) {
  const [tracking, setTracking] = useState<TrackingInfo | "loading" | "error" | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-8">
        <div
          className="relative w-full max-w-4xl bg-[#0d0b1e] border border-white/[0.125] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >

          {/* ── Header ── */}
          <div className="px-10 py-8 border-b border-white/[0.125] flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/100 mb-2">
                Order Details
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-white/100 text-3xl font-bold tracking-wide">{order.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center text-white/100 hover:text-white/100 transition mt-1 flex-shrink-0"
            >
              <X size={20} />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="px-10 py-9 flex flex-col sm:flex-row gap-10">

            {/* Left column — order fields */}
            <div className="flex flex-col gap-9 sm:w-72 sm:flex-shrink-0">

              {/* Description */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <FileText size={15} className="text-[#91bee3]" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Description</p>
                </div>
                <p className="text-white/100 text-base leading-relaxed pl-7">
                  {order.description || <span className="text-white/100 italic">No description</span>}
                </p>
              </div>

              {/* Price */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign size={15} className="text-[#FF6996]" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Price</p>
                </div>
                <p className="text-white/100 text-lg font-bold pl-7">{order.price || "—"}</p>
              </div>

              {/* Tracking number */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Hash size={15} className="text-[#629fcc]" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">Tracking #</p>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <p className="text-white/100 text-base font-mono">
                    {order.trackingNumber || "—"}
                  </p>
                  {order.trackingNumber && <CopyButton text={order.trackingNumber} />}
                </div>
              </div>
            </div>

            {/* Right column — live tracking */}
            {order.trackingNumber && (
              <div className="sm:flex-1 border-t sm:border-t-0 sm:border-l border-white/[0.125] pt-9 sm:pt-0 sm:pl-10">
                <div className="flex items-center gap-3 mb-5">
                  <MapPin size={15} className="text-[#629fcc]" />
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/100">
                    Shipment Tracking
                  </p>
                </div>

                {tracking === "loading" && (
                  <div className="flex items-center gap-3 text-white/100 pl-7">
                    <Loader2 size={13} className="animate-spin text-[#629fcc]" />
                    <span className="text-xs font-bold tracking-[0.18em] uppercase">Fetching tracking info…</span>
                  </div>
                )}

                {tracking === "error" && (
                  <div className="flex items-center gap-2 text-[#FF6996]/100 pl-7">
                    <AlertCircle size={13} />
                    <span className="text-xs">Could not retrieve tracking information.</span>
                  </div>
                )}

                {trackingInfo && (
                  <div className="pl-7 space-y-5">
                    {/* Origin / Destination / ETA */}
                    <div className="grid grid-cols-3 gap-px bg-white/[0.06] rounded-lg overflow-hidden">
                      {[
                        { icon: MapPin, label: "Origin",        val: trackingInfo.origin },
                        { icon: MapPin, label: "Destination",   val: trackingInfo.destination },
                        { icon: Clock,  label: "Est. Delivery", val: trackingInfo.estimatedDelivery ? fmt(trackingInfo.estimatedDelivery) : "—" },
                      ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="bg-[#0d0b1e] px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Icon size={10} className="text-[#629fcc]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/100">{label}</span>
                          </div>
                          <p className="text-white/100 text-sm truncate">{val}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status detail */}
                    <p className="text-white/100 text-sm leading-relaxed">{trackingInfo.statusDetail}</p>

                    {/* Timeline */}
                    {trackingInfo.events.length > 0 && (
                      <div className="max-h-60 overflow-y-auto pr-1 space-y-0">
                        {trackingInfo.events.map((ev, i) => (
                          <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                            {i < trackingInfo.events.length - 1 && (
                              <div className="absolute left-[5px] top-3 bottom-0 w-px bg-white/[0.06]" />
                            )}
                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-[#0d0b1e] ${i === 0 ? "bg-[#629fcc]" : "bg-white/100"}`} />
                            <div className="min-w-0">
                              <p className={`text-sm ${i === 0 ? "text-white/100" : "text-white/100"}`}>{ev.description}</p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {ev.location  && <span className="text-[11px] text-white/100">{ev.location}</span>}
                                {ev.timestamp && <span className="text-[11px] text-white/100">{fmt(ev.timestamp)}</span>}
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
          <div className="px-10 pb-10 border-t border-white/[0.125] pt-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-lg text-white/100 text-xs font-bold uppercase tracking-[0.2em] hover:text-white/100 border border-white/[0.08] hover:border-white/[0.14] hover:bg-white/[0.02] transition"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}