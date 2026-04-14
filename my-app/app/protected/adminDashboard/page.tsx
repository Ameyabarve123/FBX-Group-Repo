"use client";

import { useState, useEffect, useRef } from "react";
import {
  Users,
  ShoppingCart,
  TicketCheck,
  ExternalLink,
  Building2,
  Plus,
  X,
  ChevronDown,
  Package,
  DollarSign,
  Hash,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import TicketModal           from "@/components/dashboardComponents/ticketModal";
import PlanModal             from "@/components/dashboardComponents/planModal";
import OrderModal            from "@/components/dashboardComponents/orderModal";
import CredentialsModal      from "@/components/dashboardComponents/credentialsModal";
import CreateEnterpriseModal from "@/components/dashboardComponents/createEnterpriseModal";
import EnterprisePlanModal   from "@/components/dashboardComponents/enterprisePlanModal";
import type { DBUser, DBTicket, DBOrder, DBPlan } from "@/components/dashboardComponents/types";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const ACCENTS = {
  pink:   { text: "text-[#c975b9]", bg: "bg-[#c975b9]/10" },
  violet: { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10" },
  teal:   { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10" },
};

// ─── SMALL UI PIECES ──────────────────────────────────────────────────────────

function Avatar({ initials, color = "pink" }: { initials: string; color?: keyof typeof ACCENTS }) {
  const styles: Record<keyof typeof ACCENTS, string> = {
    pink:   "bg-[#c975b9]/10 text-[#c975b9] ring-1 ring-[#c975b9]/25",
    violet: "bg-[#629fcc]/10 text-[#629fcc] ring-1 ring-[#629fcc]/25",
    slate:  "bg-[#91bee3]/10 text-[#91bee3] ring-1 ring-[#91bee3]/25",
    teal:   "bg-[#629fcc]/10 text-[#629fcc] ring-1 ring-[#629fcc]/25",
  };
  return (
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold tracking-widest flex-shrink-0 ${styles[color]}`}>
      {initials}
    </div>
  );
}

function StatCard({ label, value, accent = "violet" }: { label: string; value: string; accent?: keyof typeof ACCENTS }) {
  const a = ACCENTS[accent];
  return (
    <div className="relative bg-[#0d0b1e] rounded-lg border border-white/[0.125] p-5 overflow-hidden hover:border-white/10 transition-colors duration-300">
      <p className="text-xs uppercase tracking-[0.18em] text-white/85 font-medium mb-3">{label}</p>
      <p className={`text-4xl font-bold ${a.text} tabular-nums`}>{value}</p>
    </div>
  );
}

function SectionCard({
  title, icon: Icon, count, children, accent = "violet",
}: {
  title: string; icon: LucideIcon; count?: number;
  children: React.ReactNode; accent?: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="bg-[#0d0b1e] border border-white/[0.125] rounded-lg overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.125]">
        <div className="flex items-center gap-3">
          <Icon size={15} className={a.text} />
          <h2 className="text-white/50 text-xs font-bold uppercase tracking-[0.18em]">{title}</h2>
        </div>
        {count !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${a.bg} ${a.text} tracking-wider`}>
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div
      className="hidden sm:grid px-5 py-3 border-b border-white/[0.04]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}
    >
      {cols.map((c) => (
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/80 font-bold">{c}</span>
      ))}
    </div>
  );
}

function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.04]">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="h-2.5 bg-white/5 rounded w-1/5" />
      </div>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-8 text-center text-white/50 text-xs tracking-[0.18em] uppercase">
      {message}
    </div>
  );
}

// ─── ADD ORDER PANEL ──────────────────────────────────────────────────────────

interface AddOrderPanelProps {
  enterprises: DBUser[];
  onAdd: (order: {
    user_uuid: string;
    order_title: string;
    description: string;
    price: string;
    tracking_number: string;
  }) => Promise<void>;
  onCancel: () => void;
}

function AddOrderPanel({ enterprises, onAdd, onCancel }: AddOrderPanelProps) {
  const [selectedUuid, setSelectedUuid]   = useState("");
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const [orderTitle,   setOrderTitle]     = useState("");
  const [description,  setDescription]   = useState("");
  const [price,        setPrice]         = useState("");
  const [tracking,     setTracking]      = useState("");
  const [saving,       setSaving]        = useState(false);
  const [error,        setError]         = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEnterprise = enterprises.find((e) => e.user_uuid === selectedUuid);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSubmit() {
    if (!selectedUuid)  return setError("Please select an enterprise.");
    if (!orderTitle.trim()) return setError("Order title is required.");
    if (!tracking.trim())   return setError("Tracking number is required.");
    setError(null);
    setSaving(true);
    try {
      await onAdd({
        user_uuid:       selectedUuid,
        order_title:     orderTitle.trim(),
        description:     description.trim(),
        price:           price.trim(),
        tracking_number: tracking.trim(),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add order.");
      setSaving(false);
    }
  }

  return (
    <div className="border-b border-white/[0.125] bg-[#0a0820]">
      {/* Panel header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91bee3]">New Order</span>
        <button onClick={onCancel} className="text-white/80 hover:text-white/50 transition">
          <X size={14} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Enterprise dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">
            Enterprise
          </label>
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition text-left"
          >
            {selectedEnterprise ? (
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded bg-[#629fcc]/10 flex items-center justify-center text-[9px] font-bold text-[#629fcc]">
                  {getInitials(selectedEnterprise.client_name)}
                </div>
                <span className="text-white/70 text-sm">{selectedEnterprise.client_name}</span>
              </div>
            ) : (
              <span className="text-white/80 text-sm">Select enterprise…</span>
            )}
            <ChevronDown
              size={13}
              className={`text-white/80 flex-shrink-0 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg bg-[#100d24] border border-white/[0.10] shadow-xl max-h-48 overflow-y-auto">
              {enterprises.length === 0 ? (
                <div className="px-4 py-3 text-xs text-white/80 tracking-widest uppercase">No enterprises</div>
              ) : (
                enterprises.map((e) => (
                  <button
                    key={e.user_uuid}
                    type="button"
                    onClick={() => { setSelectedUuid(e.user_uuid); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.04] transition text-left ${
                      selectedUuid === e.user_uuid ? "bg-[#629fcc]/5" : ""
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-[#629fcc]/10 flex items-center justify-center text-[9px] font-bold text-[#629fcc] flex-shrink-0">
                      {getInitials(e.client_name)}
                    </div>
                    <span className={`text-sm ${selectedUuid === e.user_uuid ? "text-[#629fcc]" : "text-white/55"}`}>
                      {e.client_name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Order fields — 2-col grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">
              <span className="flex items-center gap-1.5"><Package size={9} />Order Title <span className="text-[#c975b9]">*</span></span>
            </label>
            <input
              value={orderTitle}
              onChange={(e) => setOrderTitle(e.target.value)}
              placeholder="e.g. Robot Unit #4"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#91bee3]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">
              <span className="flex items-center gap-1.5"><Hash size={9} />Tracking Number <span className="text-[#c975b9]">*</span></span>
            </label>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. 794644792798"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#91bee3]/40 focus:outline-none text-white/70 text-sm font-mono placeholder:text-white/50 placeholder:font-sans transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">
              <span className="flex items-center gap-1.5"><DollarSign size={9} />Price</span>
            </label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. $12,000"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#91bee3]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/50 transition"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">
              Description
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes…"
              className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#91bee3]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/50 transition"
            />
          </div>
        </div>

        {error && (
          <p className="text-[#c975b9] text-xs tracking-wide">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#91bee3]/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : <><Plus size={11} />Add Order</>}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-white/80 text-[10px] font-bold uppercase tracking-[0.18em] hover:text-white/50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

export default function AdminHomepage() {
  const supabase = createClient();

  const [dbUsers,   setDbUsers]   = useState<DBUser[]>([]);
  const [dbTickets, setDbTickets] = useState<DBTicket[]>([]);
  const [dbOrders,  setDbOrders]  = useState<DBOrder[]>([]);
  const [dbPlans,   setDbPlans]   = useState<DBPlan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [selectedTicket,       setSelectedTicket]       = useState<DBTicket | null>(null);
  const [selectedPlan,         setSelectedPlan]         = useState<DBPlan | null>(null);
  const [selectedOrder,        setSelectedOrder]        = useState<DBOrder | null>(null);
  const [selectedEnterprise,   setSelectedEnterprise]   = useState<DBUser | null>(null);
  const [createEnterpriseOpen, setCreateEnterpriseOpen] = useState(false);
  const [newCredentials,       setNewCredentials]       = useState<{ name: string; email: string; password: string } | null>(null);
  const [addOrderOpen,         setAddOrderOpen]         = useState(false);

  const enterprises = dbUsers.filter((u) => u.role === 3);
  const customers   = dbUsers.filter((u) => u.role === 2);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated"); setLoading(false); return; }

      const { data: adminCheck, error: adminErr } = await supabase
        .from("users").select("is_admin").eq("user_uuid", user.id).single();
      if (adminErr || !adminCheck || adminCheck.is_admin !== 1) {
        setError("Access denied"); setLoading(false); return;
      }

      try {
        const [usersRes, ticketsRes, ordersRes, plansRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("tickets").select("*"),
          supabase.from("orders").select("*"),
          supabase.from("plans").select("*"),
        ]);
        if (usersRes.error)   throw new Error(`Users: ${usersRes.error.message}`);
        if (ticketsRes.error) throw new Error(`Tickets: ${ticketsRes.error.message}`);
        if (ordersRes.error)  throw new Error(`Orders: ${ordersRes.error.message}`);
        if (plansRes.error)   throw new Error(`Plans: ${plansRes.error.message}`);

        setDbUsers(usersRes.data   ?? []);
        setDbTickets(ticketsRes.data ?? []);
        setDbOrders(ordersRes.data  ?? []);
        setDbPlans(plansRes.data    ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function getPlanForUser(userUuid: string): DBPlan | undefined {
    return dbPlans.find((p) => p.user_uuid === userUuid);
  }

  async function handleResolve(ticket: DBTicket) {
    const { error } = await supabase.from("tickets").delete().eq("id", ticket.id);
    if (error) { console.error("Failed to resolve ticket:", error.message); return; }
    setDbTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    setSelectedTicket(null);
  }

  async function handleSavePlan(updated: Partial<DBPlan>) {
    if (!selectedEnterprise) return;
    const existing = getPlanForUser(selectedEnterprise.user_uuid);

    if (existing) {
      const { error } = await supabase.from("plans").update(updated).eq("id", existing.id);
      if (error) { console.error("Failed to update plan:", error.message); return; }
      setDbPlans((prev) => prev.map((p) => p.id === existing.id ? { ...p, ...updated } : p));
    } else {
      const { data, error } = await supabase
        .from("plans")
        .insert({ ...updated, user_uuid: selectedEnterprise.user_uuid })
        .select()
        .single();
      if (error) { console.error("Failed to create plan:", error.message); return; }
      if (data) setDbPlans((prev) => [...prev, data]);
    }
  }

  async function handleAddOrder(orderData: {
    user_uuid: string;
    order_title: string;
    description: string;
    price: string;
    tracking_number: string;
  }) {
    const { data, error } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();
    if (error) throw new Error(error.message);
    if (data) {
      setDbOrders((prev) => [...prev, data]);
      setAddOrderOpen(false);
    }
  }

  async function handleEnterpriseCreated(name: string, email: string, password: string) {
    setNewCredentials({ name, email, password });
    const [usersRes, plansRes] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("plans").select("*"),
    ]);
    if (!usersRes.error) setDbUsers(usersRes.data ?? []);
    if (!plansRes.error) setDbPlans(plansRes.data ?? []);
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="dashboard flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/50 text-base">{error}</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="dashboard flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen"
      style={{ background: 'linear-gradient(0deg, #000000 80%, #1a0f2e 87%, #223079 100%)' }}
    >

      {/* Modals */}
      {selectedTicket && (
        <TicketModal
          ticket={{
            title:   selectedTicket.title,
            name:    selectedTicket.client_name,
            contact: selectedTicket.contact_details,
            details: selectedTicket.ticket_details,
          }}
          onClose={() => setSelectedTicket(null)}
          onResolve={() => handleResolve(selectedTicket)}
        />
      )}
      {selectedPlan && (
        <PlanModal
          plan={{
            title:       selectedPlan.description,
            description: selectedPlan.description,
            price:       String(selectedPlan.price),
          }}
          onClose={() => setSelectedPlan(null)}
        />
      )}
      {selectedOrder && (
        <OrderModal
          order={{
            title:          selectedOrder.order_title,
            description:    selectedOrder.description,
            price:          selectedOrder.price,
            trackingNumber: selectedOrder.tracking_number,
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}
      {selectedEnterprise && (
        <EnterprisePlanModal
          enterprise={selectedEnterprise}
          plan={getPlanForUser(selectedEnterprise.user_uuid)}
          onClose={() => setSelectedEnterprise(null)}
          onSave={handleSavePlan}
        />
      )}
      {createEnterpriseOpen && (
        <CreateEnterpriseModal
          onClose={() => setCreateEnterpriseOpen(false)}
          onCreated={handleEnterpriseCreated}
        />
      )}
      {newCredentials && (
        <CredentialsModal
          name={newCredentials.name}
          email={newCredentials.email}
          password={newCredentials.password}
          onClose={() => setNewCredentials(null)}
        />
      )}

      {/* Page header */}
      <div className="pb-4 border-b border-white/[0.125]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/80 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-bold tracking-wide">Admin Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Enterprise"   value={String(enterprises.length).padStart(2, "0")} accent="teal"  />
        <StatCard label="Open Tickets" value={String(dbTickets.length).padStart(2, "0")}   accent="pink"  />
        <StatCard label="Orders"       value={String(dbOrders.length).padStart(2, "0")}    accent="slate" />
      </div>

      {/* Enterprise Accounts */}
      <SectionCard title="Enterprise Accounts" icon={Building2} count={enterprises.length} accent="teal">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          <button
            onClick={() => setCreateEnterpriseOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#629fcc]/15 transition"
          >
            <Plus size={12} />
            New Enterprise
          </button>
        </div>
        <TableHeader cols={["Profile", "Company", "Price", "Robots"]} />
        {loading
          ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
          : enterprises.length === 0
          ? <EmptyRow message="No enterprise accounts" />
          : enterprises.map((u) => {
              const plan    = getPlanForUser(u.user_uuid);
              const shipped = plan?.robots_shipped   ?? 0;
              const total   = plan?.robots_allocated ?? 0;
              const pct     = total > 0 ? Math.min(100, Math.round((shipped / total) * 100)) : 0;
              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedEnterprise(u)}
                  className="px-5 py-4 grid sm:grid-cols-4 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
                >
                  <Avatar initials={getInitials(u.client_name)} color="teal" />
                  <span className="text-white/60 text-sm truncate">{u.client_name}</span>
                  <span className="text-sm text-white/70">
                    {plan ? `$${plan.price.toLocaleString()}` : <span className="text-white/50">—</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {total > 0 ? (
                      <>
                        <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full bg-[#629fcc] transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-white/85 tabular-nums flex-shrink-0">{shipped}/{total}</span>
                      </>
                    ) : (
                      <span className="text-sm text-white/50">—</span>
                    )}
                    <ExternalLink size={11} className="text-[#629fcc] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
      </SectionCard>

      {/* Support Tickets */}
      <SectionCard title="Support Tickets" icon={TicketCheck} count={dbTickets.length} accent="pink">
        <TableHeader cols={["Profile", "Client", "Title"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : dbTickets.length === 0
          ? <EmptyRow message="No open tickets" />
          : dbTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
              >
                <Avatar initials={getInitials(t.client_name)} color="pink" />
                <span className="text-white/60 text-sm truncate">{t.client_name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-white/70 truncate hidden sm:block">{t.title}</span>
                  <ExternalLink size={11} className="text-[#c975b9] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
      </SectionCard>

      {/* Orders in Progress */}
      <SectionCard title="Orders in Progress" icon={ShoppingCart} count={dbOrders.length} accent="slate">

        {/* Add order toggle */}
        <div className="px-5 py-4 border-b border-white/[0.04]">
          {!addOrderOpen ? (
            <button
              onClick={() => setAddOrderOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#91bee3]/15 transition"
            >
              <Plus size={12} />
              Add Order
            </button>
          ) : null}
        </div>

        {/* Inline add-order form */}
        {addOrderOpen && (
          <AddOrderPanel
            enterprises={enterprises}
            onAdd={handleAddOrder}
            onCancel={() => setAddOrderOpen(false)}
          />
        )}

        <TableHeader cols={["Profile", "Order", "Price"]} />
        {loading
          ? [1, 2].map((i) => <LoadingRow key={i} />)
          : dbOrders.length === 0
          ? <EmptyRow message="No active orders" />
          : dbOrders.map((o) => {
              const owner = dbUsers.find((u) => u.user_uuid === o.user_uuid);
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="px-5 py-4 grid sm:grid-cols-3 items-center gap-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.015] transition-colors cursor-pointer group"
                >
                  <Avatar initials={getInitials(owner?.client_name ?? "?")} color="slate" />
                  <span className="text-white/60 text-sm truncate">{o.order_title}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white/70">{o.price}</span>
                    <ExternalLink size={11} className="text-[#91bee3] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
      </SectionCard>
    </div>
  );
}