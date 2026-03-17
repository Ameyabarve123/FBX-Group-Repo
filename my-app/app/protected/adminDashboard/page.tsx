"use client";

// ─── 1. IMPORTS — add useState and TicketModal ────────────────────────────────
import { useState } from "react";
import {
  Users,
  ShoppingCart,
  TicketCheck,
  ExternalLink,
  TrendingUp,
  LucideIcon,
} from "lucide-react";
import TicketModal from "@/components/dashboardComponents/ticketModal";
import PlanModal from "@/components/dashboardComponents/planModal";
import OrderModal from "@/components/dashboardComponents/orderModal";

// ─── 2. TYPES ─────────────────────────────────────────────────────────────────
interface Customer {
  id: number;
  name: string;
  plan: string;
  initials: string;
  active: boolean;
}

interface Ticket {
  id: number;
  customer: string;
  initials: string;
  title: string;
  priority: "high" | "medium" | "low";
  // These fields feed the modal
  contact: string;
  details: string;
}

interface Order {
  id: number;
  customer: string;
  initials: string;
  details: string;
  // Add these:
  description: string;
  price: string;
  trackingNumber: string;
}

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  color: string;
}

interface AvatarProps {
  initials: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "accent";
}

interface SectionCardProps {
  title: string;
  icon: LucideIcon;
  count?: number;
  children: React.ReactNode;
  accentColor?: string;
}

// ─── 3. DUMMY DATA — added contact + details to tickets ──────────────────────
const customers: Customer[] = [
  { id: 1, name: "Customer1", plan: "Plan1", initials: "C1", active: true },
  { id: 2, name: "Customer2", plan: "Plan2", initials: "C2", active: false },
];

const tickets: Ticket[] = [
  {
    id: 1,
    customer: "Customer1",
    initials: "C1",
    title: "Title1",
    priority: "high",
    contact: "customer1@email.com",
    details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    id: 2,
    customer: "Customer2",
    initials: "C2",
    title: "Title2",
    priority: "medium",
    contact: "customer2@email.com",
    details: "Sed do eiusmod tempor incididunt ut labore et dolore magna.",
  },
];

const orders: Order[] = [
  {
    id: 1,
    customer: "Customer2",
    initials: "C2",
    details: "Order #4821 – 3 items",
    description: "Lorem ipsum dolor sit amet.",
    price: "$49.99",
    trackingNumber: "1Z999AA10123456784",
  },
];

// ─── 4. SUB-COMPONENTS (unchanged) ───────────────────────────────────────────
function Avatar({ initials, size = "md", color = "primary" }: AvatarProps) {
  const sizes: Record<string, string> = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 sm:w-11 sm:h-11 text-sm",
    lg: "w-14 h-14 text-base",
  };
  const colors: Record<string, string> = {
    primary: "bg-[#F97B8B] text-[#1a1a2e]",
    secondary: "bg-[#7B93F9] text-[#1a1a2e]",
    accent: "bg-[#8B7B8F] text-[#e8e0ee]",
  };
  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-xl flex items-center justify-center font-bold tracking-wide flex-shrink-0 shadow-lg`}
    >
      {initials}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-[#c4b8d4]">{plan}</span>
      <ExternalLink size={12} className="text-[#F97B8B] flex-shrink-0" />
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Ticket["priority"] }) {
  const styles: Record<Ticket["priority"], string> = {
    high: "bg-[#F97B8B]/20 text-[#F97B8B] border-[#F97B8B]/30",
    medium: "bg-[#7B93F9]/20 text-[#7B93F9] border-[#7B93F9]/30",
    low: "bg-[#8B7B8F]/20 text-[#8B7B8F] border-[#8B7B8F]/30",
  };
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[priority]} tracking-wide uppercase whitespace-nowrap`}
    >
      {priority}
    </span>
  );
}

function StatCard({ label, value, delta, color }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-[#1e1c2e] border border-white/5 p-4 sm:p-5 flex flex-col gap-2 sm:gap-3 shadow-xl">
      <span className="text-[#8b8099] text-[10px] sm:text-xs uppercase tracking-widest font-semibold">
        {label}
      </span>
      <span className="text-[#e8e0ee] text-2xl sm:text-3xl font-bold tracking-tight">{value}</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        <TrendingUp size={11} style={{ color }} />
        <span className="text-xs font-semibold" style={{ color }}>
          {delta}
        </span>
        <span className="text-[#8b8099] text-xs">vs last month</span>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  count,
  children,
  accentColor = "#F97B8B",
}: SectionCardProps) {
  return (
    <div className="rounded-2xl bg-[#1e1c2e] border border-white/5 overflow-hidden shadow-xl">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${accentColor}22` }}
          >
            <Icon size={16} style={{ color: accentColor }} />
          </div>
          <h2 className="text-[#e8e0ee] font-semibold text-sm sm:text-base tracking-wide">
            {title}
          </h2>
        </div>
        {count !== undefined && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
          >
            {count}
          </span>
        )}
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );
}

// ─── 5. PAGE COMPONENT ────────────────────────────────────────────────────────
export default function AdminHomepage() {

  // ── 6. STATE — selected ticket drives the modal ──────────────────────────
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ title: string; description: string; price: string } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ title: string; description: string; price: string; trackingNumber: string } | null>(null);

  // ── 7. HANDLER — called when Resolve is clicked inside the modal ─────────
  const handleResolve = (ticket: Ticket) => {
    console.log("Resolved ticket:", ticket);
    // TODO: call your API here, e.g. await resolveTicket(ticket.id)
  };

  return (
    <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-auto">

      {/* ── 8. MODAL — renders on top when a ticket is selected ────────────── */}
      {selectedTicket && (
        <TicketModal
          ticket={{
            title: selectedTicket.title,
            name: selectedTicket.customer,
            contact: selectedTicket.contact,
            details: selectedTicket.details,
          }}
          onClose={() => setSelectedTicket(null)}
          onResolve={() => handleResolve(selectedTicket)}
        />
      )}

      {selectedPlan && (
        <PlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Customers" value="128" delta="+12%" color="#F97B8B" />
        <StatCard label="Open Tickets" value="24" delta="+3%" color="#7B93F9" />
        <StatCard label="Orders" value="57" delta="+8%" color="#8B7B8F" />
        <StatCard label="Revenue" value="$9.4k" delta="+21%" color="#F97B8B" />
      </div>

      {/* Customers */}
      <SectionCard title="Customers" icon={Users} count={customers.length} accentColor="#F97B8B">
        <div className="hidden sm:grid px-6 py-2 grid-cols-3 text-[10px] uppercase tracking-widest text-[#4a4560] font-bold">
          <span>Profile</span>
          <span>Name</span>
          <span>Plan</span>
        </div>
        {customers.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedPlan({ title: c.plan, description: "Lorem ipsum...", price: "$9/mo" })}
            className="px-4 sm:px-6 py-4 flex sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-0 hover:bg-white/[0.03] transition group cursor-pointer"
          >
            <Avatar initials={c.initials} color="primary" />
            <div className="flex-1 sm:flex-none flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm text-[#e8e0ee] truncate">{c.name}</span>
              {c.active && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <PlanBadge plan={c.plan} />
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Support Tickets */}
      <SectionCard
        title="Support Tickets"
        icon={TicketCheck}
        count={tickets.length}
        accentColor="#7B93F9"
      >
        <div className="hidden sm:grid px-6 py-2 grid-cols-3 text-[10px] uppercase tracking-widest text-[#4a4560] font-bold">
          <span>Profile</span>
          <span>Name</span>
          <span>Title</span>
        </div>
        {tickets.map((t) => (
          // ── 9. onClick on each ticket row opens the modal ─────────────────
          <div
            key={t.id}
            onClick={() => setSelectedTicket(t)}
            className="px-4 sm:px-6 py-4 flex sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-0 hover:bg-white/[0.03] transition group cursor-pointer"
          >
            <Avatar initials={t.initials} color="secondary" />
            <span className="flex-1 sm:flex-none font-medium text-sm text-[#e8e0ee] truncate">
              {t.customer}
            </span>
            <div className="flex items-center justify-end sm:justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-[#c4b8d4] truncate hidden sm:inline">{t.title}</span>
                <ExternalLink size={12} className="text-[#7B93F9] flex-shrink-0" />
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          </div>
        ))}
      </SectionCard>

      {/* Current Orders */}
      <SectionCard
        title="Current Orders In Progress"
        icon={ShoppingCart}
        count={orders.length}
        accentColor="#8B7B8F"
      >
        <div className="hidden sm:grid px-6 py-2 grid-cols-3 text-[10px] uppercase tracking-widest text-[#4a4560] font-bold">
          <span>Profile</span>
          <span>Name</span>
          <span>Details</span>
        </div>
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelectedOrder({
              title: o.details,
              description: o.description,
              price: o.price,
              trackingNumber: o.trackingNumber,
            })}
            className="px-4 sm:px-6 py-4 flex sm:grid sm:grid-cols-3 items-center gap-3 sm:gap-0 hover:bg-white/[0.03] transition group cursor-pointer"
          >
            <Avatar initials={o.initials} color="accent" />
            <span className="flex-1 sm:flex-none font-medium text-sm text-[#e8e0ee] truncate">
              {o.customer}
            </span>
            <div className="flex items-center gap-2 min-w-0 justify-end sm:justify-start">
              <span className="text-sm text-[#c4b8d4] truncate">{o.details}</span>
              <ExternalLink
                size={12}
                className="text-[#8B7B8F] group-hover:text-[#e8e0ee] transition flex-shrink-0"
              />
            </div>
          </div>
        ))}
      </SectionCard>
    </div>
  );
}