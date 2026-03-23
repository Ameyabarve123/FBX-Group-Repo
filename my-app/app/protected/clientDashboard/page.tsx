"use client";

import { useState } from "react";
import {
  Package,
  TicketCheck,
  ExternalLink,
  ChevronRight,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Zap,
  Shield,
  LucideIcon,
} from "lucide-react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Plan {
  tier: string;
  price: string;
  features: string[];
  icon: LucideIcon;
  color: string;
}

interface Shipment {
  id: number;
  label: string;
  eta: string;
  status: "in_transit" | "delivered" | "processing" | "delayed";
  trackingNumber: string;
//   items: number;
}

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const currentPlan: Plan = {
  tier: "Basic Tier",
  price: "$3,000",
  features: ["25 kits/month"],
  icon: Star,
  color: "#F97B8B",
};

const shipments: Shipment[] = [
  {
    id: 1,
    label: "25 kits",
    eta: "12:00 – 3:00 PM, Jan 1",
    status: "in_transit",
    trackingNumber: "1Z999AA10123456784",

  },
];

// ─── ALL PLANS (for upgrade modal) ───────────────────────────────────────────
const allPlans = [
  {
    tier: "Basic Tier",
    price: "$3,000",
    color: "#F97B8B",
    icon: Star,
    features: ["25 kits/month"],
  },
  {
    tier: "Pro Tier",
    price: "$6,000",
    color: "#7B93F9",
    icon: Zap,
    features: ["50 kits/month"],
  },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
const statusConfig = {
  in_transit: { label: "In Transit", color: "#7B93F9", bg: "#7B93F9", icon: Truck },
  delivered:  { label: "Delivered",  color: "#4ade80", bg: "#4ade80", icon: CheckCircle2 },
  processing: { label: "Processing", color: "#F97B8B", bg: "#F97B8B", icon: Clock },
  delayed:    { label: "Delayed",    color: "#fb923c", bg: "#fb923c", icon: AlertCircle },
};

// ─── PLAN ICON MAP ────────────────────────────────────────────────────────────
const tierIcons: Record<string, { icon: LucideIcon; color: string }> = {
  "Basic Tier":      { icon: Star,   color: "#F97B8B" },
  "Pro Tier":        { icon: Zap,    color: "#7B93F9" },
  "Enterprise Tier": { icon: Shield, color: "#8B7B8F" },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon: Icon,
  accentColor = "#F97B8B",
  children,
}: {
  title: string;
  icon: LucideIcon;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#1e1c2e] border border-white/5 overflow-hidden shadow-xl">
      <div className="px-4 sm:px-6 py-4 flex items-center gap-3 border-b border-white/5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${accentColor}22` }}
        >
          <Icon size={16} style={{ color: accentColor }} />
        </div>
        <h2 className="text-[#e8e0ee] font-semibold text-sm sm:text-base tracking-wide">{title}</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Shipment["status"] }) {
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;
  return (
    <span
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap"
      style={{ backgroundColor: `${cfg.bg}20`, color: cfg.color, borderColor: `${cfg.bg}30` }}
    >
      <StatusIcon size={11} />
      {cfg.label}
    </span>
  );
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function UpgradeModal({ currentTier, onClose }: { currentTier: string; onClose: () => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-[#e8e0ee] font-semibold text-lg">Plan Upgraded!</h3>
          <p className="text-[#8b8099] text-sm">
            You're now on the <span className="text-[#e8e0ee] font-medium">{selected}</span>.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97B8B] text-[#1a1a2e] font-semibold text-sm hover:bg-[#f96070] transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F97B8B]/20 flex items-center justify-center">
              <Zap size={16} className="text-[#F97B8B]" />
            </div>
            <h3 className="text-[#e8e0ee] font-semibold text-base">Upgrade Plan</h3>
          </div>
          <button onClick={onClose} className="text-[#8b8099] hover:text-[#e8e0ee] transition text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-3">
          {allPlans.map((plan) => {
            const PlanIcon = plan.icon;
            const isCurrent = plan.tier === currentTier;
            const isSelected = selected === plan.tier;
            return (
              <button
                key={plan.tier}
                disabled={isCurrent}
                onClick={() => setSelected(plan.tier)}
                className={`w-full text-left rounded-xl p-4 border transition flex items-start gap-4 ${
                  isCurrent
                    ? "opacity-40 cursor-not-allowed border-white/5 bg-white/[0.02]"
                    : isSelected
                    ? "bg-white/[0.05]"
                    : "border-white/5 bg-[#161428] hover:bg-white/[0.04] hover:border-white/10"
                }`}
                style={isSelected ? { borderColor: `${plan.color}50` } : {}}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${plan.color}22` }}
                >
                  <PlanIcon size={18} style={{ color: plan.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#e8e0ee]">{plan.tier}</span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-widest font-bold text-[#4a4560]">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="font-bold" style={{ color: plan.color }}>{plan.price}</span>
                      <span className="text-[#8b8099] text-xs">/mo</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {plan.features.map((f) => (
                      <span key={f} className="text-xs text-[#8b8099]">{f}</span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#8b8099] text-sm font-medium hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => selected && setConfirmed(true)}
            disabled={!selected}
            className="flex-1 py-2.5 rounded-xl bg-[#F97B8B] text-[#1a1a2e] font-semibold text-sm hover:bg-[#f96070] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CANCEL MODAL ─────────────────────────────────────────────────────────────
function CancelModal({ tier, onClose }: { tier: string; onClose: () => void }) {
  const [cancelled, setCancelled] = useState(false);

  if (cancelled) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#8b8099]/20 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-[#8b8099]" />
          </div>
          <h3 className="text-[#e8e0ee] font-semibold text-lg">Plan Cancelled</h3>
          <p className="text-[#8b8099] text-sm">
            Your plan has been cancelled. You'll retain access until the end of your billing period.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-xl bg-white/10 text-[#e8e0ee] font-semibold text-sm hover:bg-white/15 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            <h3 className="text-[#e8e0ee] font-semibold text-base">Cancel Plan</h3>
          </div>
          <button onClick={onClose} className="text-[#8b8099] hover:text-[#e8e0ee] transition text-xl leading-none">×</button>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-[#e8e0ee] font-medium">Are you sure you want to cancel?</p>
          <p className="text-xs text-[#8b8099] mt-1">
            You're about to cancel your <span className="text-[#e8e0ee]">{tier}</span>. You'll lose access to all plan features at the end of your current billing cycle.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#8b8099] text-sm font-medium hover:bg-white/5 transition"
          >
            Keep Plan
          </button>
          <button
            onClick={() => setCancelled(true)}
            className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/30 transition border border-red-500/20"
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TICKET MODAL ─────────────────────────────────────────────────────────────
function TicketSubmitModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
        <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-[#e8e0ee] font-semibold text-lg">Ticket Submitted!</h3>
          <p className="text-[#8b8099] text-sm">We'll get back to you within 24 hours.</p>
          <button
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-xl bg-[#F97B8B] text-[#1a1a2e] font-semibold text-sm hover:bg-[#f96070] transition"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7B93F9]/20 flex items-center justify-center">
              <TicketCheck size={16} className="text-[#7B93F9]" />
            </div>
            <h3 className="text-[#e8e0ee] font-semibold text-base">Submit Help Ticket</h3>
          </div>
          <button onClick={onClose} className="text-[#8b8099] hover:text-[#e8e0ee] transition text-xl leading-none">×</button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#4a4560]">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Missing item in order"
              className="bg-[#161428] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e8e0ee] placeholder:text-[#4a4560] outline-none focus:border-[#7B93F9]/50 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest font-bold text-[#4a4560]">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your issue in detail..."
              className="bg-[#161428] border border-white/10 rounded-xl px-4 py-3 text-sm text-[#e8e0ee] placeholder:text-[#4a4560] outline-none focus:border-[#7B93F9]/50 transition resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-[#8b8099] text-sm font-medium hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => setSubmitted(true)}
            disabled={!subject || !message}
            className="flex-1 py-2.5 rounded-xl bg-[#F97B8B] text-[#1a1a2e] font-semibold text-sm hover:bg-[#f96070] transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SHIPMENT DETAIL MODAL ────────────────────────────────────────────────────
function ShipmentModal({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0d0b1a]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#1e1c2e] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B7B8F]/20 flex items-center justify-center">
              <Package size={16} className="text-[#8B7B8F]" />
            </div>
            <h3 className="text-[#e8e0ee] font-semibold text-base">Current Location</h3>
          </div>
          <button onClick={onClose} className="text-[#8b8099] hover:text-[#e8e0ee] transition text-xl leading-none">×</button>
        </div>
        <div>
            <p>Placeholder for Shipping API</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#8B7B8F]/20 text-[#8B7B8F] font-semibold text-sm hover:bg-[#8B7B8F]/30 transition border border-[#8B7B8F]/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);

  const tierCfg = tierIcons[currentPlan.tier] ?? tierIcons["Basic Tier"];
  const TierIcon = tierCfg.icon;

  return (
    <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-auto">
      {/* Modals */}
      {ticketOpen  && <TicketSubmitModal onClose={() => setTicketOpen(false)} />}
      {upgradeOpen && <UpgradeModal currentTier={currentPlan.tier} onClose={() => setUpgradeOpen(false)} />}
      {cancelOpen  && <CancelModal tier={currentPlan.tier} onClose={() => setCancelOpen(false)} />}
      {selectedShipment && (
        <ShipmentModal shipment={selectedShipment} onClose={() => setSelectedShipment(null)} />
      )}

      {/* Header */}
      <div>
        <h1 className="text-[#e8e0ee] text-2xl sm:text-3xl font-bold tracking-tight">Client Dashboard</h1>
        <p className="text-[#8b8099] text-sm mt-1">Welcome back, Customer1</p>
      </div>

      {/* Current Plan */}
      <SectionCard title="Current Plan" icon={Star} accentColor="#F97B8B">
        <div className="hidden sm:grid px-6 py-2 grid-cols-3 text-[10px] uppercase tracking-widest text-[#4a4560] font-bold border-b border-white/5">
          <span>Current Tier</span>
          <span />
          <span className="text-right">Price</span>
        </div>

        <div className="px-4 sm:px-6 py-4 flex sm:grid sm:grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-3 col-span-1">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{ backgroundColor: `${tierCfg.color}22` }}
            >
              <TierIcon size={22} style={{ color: tierCfg.color }} />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[#e8e0ee]">{currentPlan.tier}</span>
                {/* <ExternalLink size={12} className="text-[#F97B8B]" /> */}
              </div>
              {currentPlan.features.map((f) => (
                <span key={f} className="text-xs text-[#8b8099]">{f}</span>
              ))}
            </div>
          </div>

          <div />

          <div className="hidden sm:flex items-center justify-end">
            <span className="text-[#e8e0ee] font-bold text-lg">{currentPlan.price}</span>
            <span className="text-[#8b8099] text-xs ml-1">/mo</span>
          </div>
        </div>

        {/* Plan actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <button
            onClick={() => setCancelOpen(true)}
            className="text-xs font-semibold text-[#8b8099] hover:text-red-400 transition"
          >
            Cancel Plan
          </button>
          <button
            onClick={() => setUpgradeOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#F97B8B] hover:text-[#f96070] transition"
          >
            Upgrade Plan <ChevronRight size={13} />
          </button>
        </div>
      </SectionCard>

      {/* Track Shipments */}
      <SectionCard title="Track Shipments" icon={Package} accentColor="#8B7B8F">
        <div className="hidden sm:grid px-6 py-2 grid-cols-3 text-[10px] uppercase tracking-widest text-[#4a4560] font-bold border-b border-white/5">
          <span>Shipment</span>
          <span>ETA</span>
          <span>Status</span>
        </div>

        {shipments.map((s) => (
          <div
            key={s.id}
            onClick={() => setSelectedShipment(s)}
            className="px-4 sm:px-6 py-4 flex sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-0 hover:bg-white/[0.03] transition group cursor-pointer border-t border-white/5 first:border-t-0"
          >
            <div className="flex items-center gap-3 flex-1 sm:flex-none min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#8B7B8F]/20 flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-[#8B7B8F]" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-[#e8e0ee] truncate">{s.label}</span>
                  <ExternalLink size={11} className="text-[#8B7B8F] flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </div>
            </div>
            <span className="hidden sm:block text-sm text-[#c4b8d4]">{s.eta}</span>
            <div className="flex items-center justify-end sm:justify-start">
              <StatusBadge status={s.status} />
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Submit Help Ticket */}
      <div className="flex justify-center pb-2">
        <button
          onClick={() => setTicketOpen(true)}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#1e1c2e] border border-white/10 text-[#e8e0ee] text-sm font-semibold hover:bg-white/[0.06] hover:border-[#7B93F9]/40 transition shadow-lg"
        >
          <TicketCheck size={15} className="text-[#7B93F9]" />
          Submit Help Ticket
        </button>
      </div>
    </div>
  );
}