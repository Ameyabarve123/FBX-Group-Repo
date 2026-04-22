"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, ExternalLink, Plus, X, ArrowLeft,
  ChevronDown, Package, Hash, DollarSign,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Avatar, SectionCard, TableHeader, LoadingRow, EmptyRow,
  getInitials, PAGE_BG,
} from "../components";

import OrderModal from "@/components/dashboardComponents/orderModal";
import type { DBUser, DBOrder } from "@/components/dashboardComponents/types";

// ── Add Order Panel ────────────────────────────────────────────────────────

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
  const [selectedUuid, setSelectedUuid] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [orderTitle,   setOrderTitle]   = useState("");
  const [description,  setDescription]  = useState("");
  const [price,        setPrice]        = useState("");
  const [tracking,     setTracking]     = useState("");
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedEnterprise = enterprises.find((e) => e.user_uuid === selectedUuid);

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
    if (!selectedUuid)      return setError("Please select an enterprise.");
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
      <div className="px-5 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#91bee3]">New Order</span>
        <button onClick={onCancel} className="text-white/100 hover:text-white/100 transition"><X size={14} /></button>
      </div>
      <div className="px-5 py-5 space-y-4">
        {/* Enterprise dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/100 mb-1.5">Enterprise</label>
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
                <span className="text-white/100 text-sm">{selectedEnterprise.client_name}</span>
              </div>
            ) : (
              <span className="text-white/100 text-sm">Select enterprise…</span>
            )}
            <ChevronDown size={13} className={`text-white/100 flex-shrink-0 transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-lg bg-[#100d24] border border-white/[0.10] shadow-xl max-h-48 overflow-y-auto">
              {enterprises.length === 0 ? (
                <div className="px-4 py-3 text-xs text-white/100 tracking-widest uppercase">No enterprises</div>
              ) : (
                enterprises.map((e) => (
                  <button
                    key={e.user_uuid}
                    type="button"
                    onClick={() => { setSelectedUuid(e.user_uuid); setDropdownOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/[0.04] transition text-left ${selectedUuid === e.user_uuid ? "bg-[#629fcc]/5" : ""}`}
                  >
                    <div className="w-6 h-6 rounded bg-[#629fcc]/10 flex items-center justify-center text-[9px] font-bold text-[#629fcc] flex-shrink-0">
                      {getInitials(e.client_name)}
                    </div>
                    <span className={`text-sm ${selectedUuid === e.user_uuid ? "text-[#629fcc]" : "text-white/100"}`}>{e.client_name}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Fields */}
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: <><Package size={9} />Order Title <span className="text-[#c975b9]">*</span></>, value: orderTitle, set: setOrderTitle, placeholder: "e.g. Robot Unit #4", mono: false },
            { label: <><Hash size={9} />Tracking Number <span className="text-[#c975b9]">*</span></>, value: tracking, set: setTracking, placeholder: "e.g. 794644792798", mono: true },
            { label: <><DollarSign size={9} />Price</>, value: price, set: setPrice, placeholder: "e.g. $12,000", mono: false },
            { label: <>Description</>, value: description, set: setDescription, placeholder: "Optional notes…", mono: false },
          ].map(({ label, value, set, placeholder, mono }, i) => (
            <div key={i}>
              <label className="block text-[10px] font-bold uppercase tracking-[0.18em] text-white/100 mb-1.5">
                <span className="flex items-center gap-1.5">{label}</span>
              </label>
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#91bee3]/40 focus:outline-none text-white/100 text-sm placeholder:text-white/100 transition ${mono ? "font-mono placeholder:font-sans" : ""}`}
              />
            </div>
          ))}
        </div>

        {error && <p className="text-[#c975b9] text-xs tracking-wide">{error}</p>}

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#91bee3]/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : <><Plus size={11} />Add Order</>}
          </button>
          <button onClick={onCancel} className="px-4 py-2 text-white/100 text-[10px] font-bold uppercase tracking-[0.18em] hover:text-white/100 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const supabase = createClient();
  const router   = useRouter();

  const [dbUsers,  setDbUsers]  = useState<DBUser[]>([]);
  const [dbOrders, setDbOrders] = useState<DBOrder[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<DBOrder | null>(null);
  const [addOrderOpen,  setAddOrderOpen]  = useState(false);

  const enterprises = dbUsers.filter((u) => u.role === 3);

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
        const [usersRes, ordersRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("orders").select("*"),
        ]);
        if (usersRes.error)  throw new Error(usersRes.error.message);
        if (ordersRes.error) throw new Error(ordersRes.error.message);
        setDbUsers(usersRes.data  ?? []);
        setDbOrders(ordersRes.data ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  async function handleAddOrder(orderData: {
    user_uuid: string; order_title: string;
    description: string; price: string; tracking_number: string;
  }) {
    const { data, error } = await supabase.from("orders").insert(orderData).select().single();
    if (error) throw new Error(error.message);
    if (data) { setDbOrders((prev) => [...prev, data]); setAddOrderOpen(false); }
  }

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
            title:          selectedOrder.order_title,
            description:    selectedOrder.description,
            price:          selectedOrder.price,
            trackingNumber: selectedOrder.tracking_number,
          }}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125]">
        <button
          onClick={() => router.push("/protected/adminDashboard")}
          className="flex items-center gap-1.5 text-white/100 hover:text-white/100 text-[10px] font-bold uppercase tracking-[0.18em] mb-3 transition"
        >
          <ArrowLeft size={11} />Back
        </button>
        <p className="text-xs uppercase tracking-[0.22em] text-white/100 mb-1">FBX Technologies</p>
        <h1 className="text-white/100 text-2xl font-bold tracking-wide">Orders in Progress</h1>
      </div>

      <SectionCard title="Orders in Progress" icon={ShoppingCart} count={dbOrders.length} accent="slate">
        <div className="px-5 py-4 border-b border-white/[0.04]">
          {!addOrderOpen && (
            <button
              onClick={() => setAddOrderOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#91bee3]/10 border border-[#91bee3]/20 text-[#91bee3] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#91bee3]/15 transition"
            >
              <Plus size={12} />Add Order
            </button>
          )}
        </div>

        {addOrderOpen && (
          <AddOrderPanel
            enterprises={enterprises}
            onAdd={handleAddOrder}
            onCancel={() => setAddOrderOpen(false)}
          />
        )}

        <TableHeader cols={["Profile", "Order", "Price"]} />
        {loading
          ? [1, 2, 3].map((i) => <LoadingRow key={i} />)
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
                  <span className="text-white/100 text-sm truncate">{o.order_title}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-white/100">{o.price}</span>
                    <ExternalLink size={11} className="text-[#91bee3] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              );
            })}
      </SectionCard>
    </div>
  );
}