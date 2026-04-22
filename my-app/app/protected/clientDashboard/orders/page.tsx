"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ExternalLink,
  ArrowLeft,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import OrderModal from "@/components/dashboardComponents/orderModal";
import type { DBOrder } from "@/components/dashboardComponents/types";

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #0f262e 87%, #42696a 100%)',
};

// ─── ACCENTS ─────────────────────────────────────────────────────────────────
const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" },
  blue:   { text: "text-[#8AC7F4]", bg: "bg-[#8AC7F4]/10", border: "border-[#8AC7F4]/20" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" },
  teal:   { text: "text-[#4ecdc4]", bg: "bg-[#4ecdc4]/10", border: "border-[#4ecdc4]/20" },
};
type AccentKey = keyof typeof ACCENTS;

type Status = "in_transit" | "delivered" | "processing" | "delayed";
const STATUS_CONFIG: Record<Status, { label: string; accent: AccentKey; icon: React.ElementType }> = {
  in_transit: { label: "In Transit", accent: "slate", icon: Truck },
  delivered:  { label: "Delivered",  accent: "blue",  icon: CheckCircle2 },
  processing: { label: "Processing", accent: "pink",  icon: Clock },
  delayed:    { label: "Delayed",    accent: "pink",  icon: AlertCircle },
};

function deriveStatus(order: DBOrder): Status {
  return order.tracking_number ? "in_transit" : "processing";
}

function getInitials(name: string) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  const a = ACCENTS[cfg.accent];
  const Icon = cfg.icon;
  return (
    <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${a.bg} ${a.text} border ${a.border}`}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

function TrackingCopy({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="flex items-center gap-1.5 group/copy"
      title="Copy tracking number"
    >
      <span className="text-xs text-white/100 font-mono truncate max-w-[140px]">{value}</span>
      {copied
        ? <Check size={11} className="text-[#8AC7F4] flex-shrink-0" />
        : <Copy size={11} className="text-white/100 flex-shrink-0 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
      }
    </button>
  );
}

function Avatar({ initials, accent }: { initials: string; accent: AccentKey }) {
  const a = ACCENTS[accent];
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${a.bg} ${a.text} ring-1 ${a.border}`}>
      {initials}
    </div>
  );
}

export default function OrdersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [dbOrders, setDbOrders] = useState<DBOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_uuid", user.id);
      
      if (error) setError(error.message);
      else setDbOrders(data ?? []);
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/100 text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>
      
      {selectedOrder && (
        <OrderModal
          order={{
            title: selectedOrder.order_title,
            description: selectedOrder.description,
            price: selectedOrder.price,
            trackingNumber: selectedOrder.tracking_number,
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Header - matching client dashboard */}
      <div className="pb-4 border-b border-white/[0.125] space-y-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/protected/clientDashboard")}
            className="flex items-center gap-1.5 text-white/100 hover:text-white/100 text-[10px] font-bold uppercase tracking-[0.18em] transition"
          >
            <ArrowLeft size={11} />Back
          </button>
        </div>
        <div>
          <h1 className="text-white/100 text-2xl font-bold tracking-wide">Orders & Tracking</h1>
          <p className="text-white/100 text-sm font-light tracking-wide mt-1">Monitor your shipments and deliveries</p>
        </div>
      </div>

      {/* Orders List */}
      <div className={`rounded-xl bg-[#0d0b1e] border ${ACCENTS.blue.border} overflow-hidden`}>
        <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg ${ACCENTS.blue.bg} flex items-center justify-center`}>
              <Package size={14} className={ACCENTS.blue.text} />
            </div>
            <h2 className="text-white/100 text-xs uppercase tracking-[0.18em] font-bold">Active Orders</h2>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${ACCENTS.blue.bg} ${ACCENTS.blue.text} tracking-wider`}>
            {String(dbOrders.length).padStart(2, "0")}
          </span>
        </div>

        {/* Table Header */}
        <div className="hidden sm:grid px-5 py-3 border-b border-white/[0.06]" style={{ gridTemplateColumns: "2fr 1.5fr 1fr" }}>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/100 font-bold">Order</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/100 font-bold">Tracking</span>
          <span className="text-[11px] uppercase tracking-[0.18em] text-white/100 font-bold">Status</span>
        </div>

        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-white/100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/100 rounded w-1/3" />
                <div className="h-2.5 bg-white/100 rounded w-1/5" />
              </div>
            </div>
          ))
        ) : dbOrders.length === 0 ? (
          <div className="px-5 py-8 text-center text-white/100 text-xs tracking-[0.18em] uppercase">No active orders</div>
        ) : (
          dbOrders.map((o) => {
            const status = deriveStatus(o);
            return (
              <div
                key={o.id}
                onClick={() => setSelectedOrder(o)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.06] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Avatar initials={getInitials(o.order_title)} accent="blue" />
                  <div className="min-w-0">
                    <p className="text-white/100 text-sm truncate">{o.order_title}</p>
                    <p className="text-white/100 text-xs">{o.price}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center">
                  {o.tracking_number ? <TrackingCopy value={o.tracking_number} /> : <span className="text-white/100 text-xs">—</span>}
                </div>
                <div className="flex items-center gap-2 justify-end sm:justify-start">
                  <StatusBadge status={status} />
                  <ExternalLink size={11} className="text-[#8AC7F4] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}