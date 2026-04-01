"use client";

import { useState, useRef, useEffect } from "react";
import {
  Package,
  ChevronDown,
  Search,
  Copy,
  Check,
  Loader2,
  MapPin,
  Clock,
  Truck,
  AlertCircle,
  X,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────

interface DBUser {
  id: string;
  client_name: string;
  is_admin: boolean;
  user_uuid: string;
  role: number;
}

interface DBOrder {
  id: string;
  order_title: string;
  description: string;
  price: string;
  tracking_number: string;
  user_uuid: string;
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

interface TrackingSectionProps {
  dbUsers: DBUser[];
  dbOrders: DBOrder[];
}

// ─── FEDEX CALL (via internal API route) ─────────────────────────────────────

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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    DL: { label: "Delivered",          color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    OD: { label: "Out for Delivery",   color: "text-[#f59e42] bg-[#f59e42]/10 border-[#f59e42]/20" },
    IT: { label: "In Transit",         color: "text-[#9b7fe8] bg-[#9b7fe8]/10 border-[#9b7fe8]/20" },
    PU: { label: "Picked Up",          color: "text-[#7e8fb5] bg-[#7e8fb5]/10 border-[#7e8fb5]/20" },
    DE: { label: "Delivery Exception", color: "text-[#e8629a] bg-[#e8629a]/10 border-[#e8629a]/20" },
  };
  const cfg = map[status.toUpperCase()] ?? {
    label: status,
    color: "text-white/40 bg-white/5 border-white/10",
  };
  return (
    <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ─── TRACKING PANEL ───────────────────────────────────────────────────────────

function TrackingPanel({ info, onClose }: { info: TrackingInfo; onClose: () => void }) {
  const fmt = (iso: string) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      });
    } catch { return iso; }
  };

  return (
    <div className="border border-[#f59e42]/20 bg-[#0d0c14] mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/20 text-[11px] tracking-[0.18em] uppercase font-mono">
              {info.trackingNumber}
            </span>
            <StatusBadge status={info.status} />
          </div>
          <p className="text-white/50 text-sm">{info.statusDetail}</p>
        </div>
        <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0 mt-0.5">
          <X size={14} />
        </button>
      </div>

      {/* Meta */}
      <div className="grid gap-px bg-white/[0.04] border-b border-white/[0.06]"
        style={{ gridTemplateColumns: `repeat(${[info.origin, info.destination, info.estimatedDelivery].filter(v => v && v !== "—").length || 1}, 1fr)` }}>
        {[
          { icon: MapPin, val: info.origin },
          { icon: MapPin, val: info.destination },
          { icon: Clock,  val: info.estimatedDelivery ? fmt(info.estimatedDelivery) : null },
        ].filter(({ val }) => val).map(({ icon: Icon, val }, i) => (
          <div key={i} className="bg-[#0d0c14] px-4 py-3 flex items-center gap-2">
            <Icon size={10} className="text-[#f59e42] flex-shrink-0" />
            <p className="text-white/50 text-xs">{val}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      {info.events.length > 0 && (
        <div className="px-5 py-4 max-h-56 overflow-y-auto">
          <div className="space-y-0">
            {info.events.map((ev, i) => (
              <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                {i < info.events.length - 1 && (
                  <div className="absolute left-[5px] top-3 bottom-0 w-px bg-white/[0.06]" />
                )}
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ring-2 ring-[#0d0c14] ${i === 0 ? "bg-[#f59e42]" : "bg-white/15"}`} />
                <div className="min-w-0">
                  <p className={`text-xs ${i === 0 ? "text-white/70" : "text-white/35"}`}>{ev.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ev.location  && <span className="text-[11px] text-white/20">{ev.location}</span>}
                    {ev.timestamp && <span className="text-[11px] text-white/15">{fmt(ev.timestamp)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span onClick={copy} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && copy(e as never)} className="flex-shrink-0 text-white/20 hover:text-[#f59e42] transition-colors cursor-pointer" title="Copy tracking number">
      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
    </span>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function TrackingSection({ dbUsers, dbOrders }: TrackingSectionProps) {
  const teachers = dbUsers.filter((u) => u.role === 0 && !u.is_admin);

  const [selectedUser, setSelectedUser] = useState<DBUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch]             = useState("");
  const [trackingMap, setTrackingMap]   = useState<Record<string, TrackingInfo | "loading" | "error">>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const teacherOrders = selectedUser
    ? dbOrders.filter((o) => o.user_uuid === selectedUser.user_uuid && o.tracking_number)
    : [];

  const filteredTeachers = teachers.filter((u) =>
    u.client_name.toLowerCase().includes(search.toLowerCase())
  );

  function getInitials(name: string) {
    if (!name) return "?";
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  async function handleOrderClick(order: DBOrder) {
    const key = order.id;
    if (trackingMap[key] === "loading") return;
    // Toggle off if already open
    if (trackingMap[key] && trackingMap[key] !== "error") {
      setTrackingMap((prev) => { const next = { ...prev }; delete next[key]; return next; });
      return;
    }
    setTrackingMap((prev) => ({ ...prev, [key]: "loading" }));
    try {
      const info = await fetchTracking(order.tracking_number);
      setTrackingMap((prev) => ({ ...prev, [key]: info }));
    } catch (err) {
      console.error(err);
      setTrackingMap((prev) => ({ ...prev, [key]: "error" }));
    }
  }

  return (
    <div className="bg-[#0d0c14] border border-white/[0.06]">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Truck size={15} className="text-[#f59e42]" />
          <h2 className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">Order Tracking</h2>
        </div>
        {selectedUser && (
          <span className="text-xs font-bold px-2 py-0.5 bg-[#f59e42]/10 text-[#f59e42] tracking-wider">
            {String(teacherOrders.length).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Teacher dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 bg-[#080710] border transition-colors duration-200 ${
              dropdownOpen ? "border-[#f59e42]/40" : "border-white/[0.06] hover:border-white/15"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {selectedUser ? (
                <>
                  <div className="w-6 h-6 rounded bg-[#f59e42]/10 text-[#f59e42] ring-1 ring-[#f59e42]/25 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {getInitials(selectedUser.client_name)}
                  </div>
                  <span className="text-white/60 text-sm truncate">{selectedUser.client_name}</span>
                </>
              ) : (
                <>
                  <Package size={14} className="text-white/20 flex-shrink-0" />
                  <span className="text-white/25 text-sm">Select a teacher to view orders…</span>
                </>
              )}
            </div>
            <ChevronDown size={14} className={`text-white/25 flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-px bg-[#0d0c14] border border-[#f59e42]/20 shadow-2xl shadow-black/60">
              <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-2">
                <Search size={12} className="text-white/25 flex-shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search teachers…"
                  className="flex-1 bg-transparent text-white/60 text-sm placeholder:text-white/15 outline-none"
                />
              </div>
              <div className="max-h-52 overflow-y-auto">
                {filteredTeachers.length === 0 ? (
                  <div className="px-4 py-5 text-center text-white/15 text-xs tracking-[0.18em] uppercase">No teachers found</div>
                ) : (
                  filteredTeachers.map((u) => {
                    const orderCount = dbOrders.filter((o) => o.user_uuid === u.user_uuid).length;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedUser(u);
                          setDropdownOpen(false);
                          setSearch("");
                          setTrackingMap({});
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.015] transition-colors border-b border-white/[0.04] last:border-0 ${
                          selectedUser?.id === u.id ? "bg-[#f59e42]/5" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#f59e42]/10 text-[#f59e42] ring-1 ring-[#f59e42]/25 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                            {getInitials(u.client_name)}
                          </div>
                          <span className="text-white/55 text-sm">{u.client_name}</span>
                        </div>
                        <span className="text-[11px] text-white/20">{orderCount} order{orderCount !== 1 ? "s" : ""}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Orders */}
        {selectedUser && (
          <div className="space-y-1">
            {teacherOrders.length === 0 ? (
              <div className="px-4 py-6 text-center text-white/15 text-xs tracking-[0.18em] uppercase border border-white/[0.04]">
                No tracked orders for this teacher
              </div>
            ) : (
              teacherOrders.map((order) => {
                const tracking = trackingMap[order.id];
                const isOpen   = tracking && tracking !== "loading" && tracking !== "error";
                return (
                  <div key={order.id}>
                    <button
                      onClick={() => handleOrderClick(order)}
                      disabled={tracking === "loading"}
                      className={`w-full flex items-center justify-between px-4 py-3 border transition-colors duration-200 group ${
                        isOpen
                          ? "border-[#f59e42]/20 bg-[#f59e42]/[0.03]"
                          : "border-white/[0.06] bg-[#080710] hover:border-white/15 hover:bg-white/[0.015]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Package size={13} className={isOpen ? "text-[#f59e42]" : "text-white/20"} />
                        <div className="text-left min-w-0">
                          <p className="text-white/60 text-sm truncate">{order.order_title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-white/20 font-mono">{order.tracking_number}</span>
                            <CopyButton text={order.tracking_number} />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-white/25 text-xs">{order.price}</span>
                        {tracking === "loading" ? (
                          <Loader2 size={13} className="text-[#f59e42] animate-spin" />
                        ) : tracking === "error" ? (
                          <AlertCircle size={13} className="text-[#e8629a]" />
                        ) : isOpen ? (
                          <StatusBadge status={(tracking as TrackingInfo).status} />
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-white/15 group-hover:text-white/30 transition-colors">
                            Track →
                          </span>
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <TrackingPanel
                        info={tracking as TrackingInfo}
                        onClose={() => setTrackingMap((prev) => { const next = { ...prev }; delete next[order.id]; return next; })}
                      />
                    )}

                    {tracking === "error" && (
                      <div className="px-4 py-3 border border-[#e8629a]/20 bg-[#e8629a]/5 flex items-center gap-2">
                        <AlertCircle size={12} className="text-[#e8629a] flex-shrink-0" />
                        <span className="text-[#e8629a]/70 text-xs">
                          Failed to retrieve tracking info.{" "}
                          <button onClick={() => handleOrderClick(order)} className="underline underline-offset-2 hover:text-[#e8629a]">
                            Retry
                          </button>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}