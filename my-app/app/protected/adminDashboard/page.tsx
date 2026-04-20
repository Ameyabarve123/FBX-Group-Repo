"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  TicketCheck,
  ShoppingCart,
  ArrowRight,
  Plus,
  X,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatCard, PAGE_BG } from "./components";

import CreateEnterpriseModal from "@/components/dashboardComponents/createEnterpriseModal";
import CredentialsModal      from "@/components/dashboardComponents/credentialsModal";
import type { DBUser, DBTicket, DBOrder, DBPlan } from "@/components/dashboardComponents/types";

// ── Invoice types & helpers ────────────────────────────────────────────────

type InvoiceLine = {
  id: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
};

type InvoiceFormState = {
  clientName: string;
  email: string;
  address: string;
  phone: string;
  notes: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  terms: string;
  lines: InvoiceLine[];
};

let lineCounter = 0;
function newInvoiceLine(): InvoiceLine {
  const id = `line-${++lineCounter}`;
  return { id, name: "", description: "", price: "", quantity: "1" };
}

function emptyInvoiceForm(): InvoiceFormState {
  return {
    clientName: "", email: "", address: "", phone: "", notes: "",
    invoiceNumber: "", invoiceDate: "", dueDate: "",
    terms: "Paid by the Due Date",
    lines: [newInvoiceLine()],
  };
}

const invFieldClass =
  "w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] focus:border-[#c975b9]/40 focus:outline-none text-white/70 text-sm placeholder:text-white/25 transition";
const invLabelClass =
  "block text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5";

// ── Nav tiles ──────────────────────────────────────────────────────────────

function NavTile({
  href, icon: Icon, label, count, accent,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  count: number;
  accent: { text: string; bg: string; border: string };
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`group relative flex flex-col gap-4 p-5 rounded-xl bg-[#0d0b1e] border ${accent.border} hover:border-opacity-60 transition-all duration-200 text-left w-full overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg ${accent.bg} flex items-center justify-center`}>
          <Icon size={16} className={accent.text} />
        </div>
        <span className={`text-2xl font-bold tabular-nums ${accent.text}`}>
          {String(count).padStart(2, "0")}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/55 text-xs font-bold uppercase tracking-[0.18em]">{label}</span>
        <ArrowRight size={13} className={`${accent.text} opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200`} />
      </div>
    </button>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminHomepage() {
  const supabase = createClient();

  const [dbUsers,   setDbUsers]   = useState<DBUser[]>([]);
  const [dbTickets, setDbTickets] = useState<DBTicket[]>([]);
  const [dbOrders,  setDbOrders]  = useState<DBOrder[]>([]);
  const [dbPlans,   setDbPlans]   = useState<DBPlan[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const [createEnterpriseOpen, setCreateEnterpriseOpen] = useState(false);
  const [newCredentials, setNewCredentials]             = useState<{ name: string; email: string; password: string } | null>(null);
  const [invoiceMenuOpen, setInvoiceMenuOpen]           = useState(false);
  const [invoiceBusy, setInvoiceBusy]                   = useState(false);
  const [invoiceErr, setInvoiceErr]                     = useState<string | null>(null);
  const [invoiceForm, setInvoiceForm]                   = useState<InvoiceFormState>(() => emptyInvoiceForm());

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
        const [usersRes, ticketsRes, ordersRes, plansRes] = await Promise.all([
          supabase.from("users").select("*"),
          supabase.from("tickets").select("*").eq("resolved", 0),
          supabase.from("orders").select("*"),
          supabase.from("plans").select("*"),
        ]);
        if (usersRes.error)   throw new Error(usersRes.error.message);
        if (ticketsRes.error) throw new Error(ticketsRes.error.message);
        if (ordersRes.error)  throw new Error(ordersRes.error.message);
        if (plansRes.error)   throw new Error(plansRes.error.message);

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

  async function handleEnterpriseCreated(name: string, email: string, password: string) {
    setNewCredentials({ name, email, password });
    const [usersRes, plansRes] = await Promise.all([
      supabase.from("users").select("*"),
      supabase.from("plans").select("*"),
    ]);
    if (!usersRes.error) setDbUsers(usersRes.data ?? []);
    if (!plansRes.error) setDbPlans(plansRes.data ?? []);
  }

  function updateInvoiceLine(id: string, patch: Partial<Omit<InvoiceLine, "id">>) {
    setInvoiceForm((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function addInvoiceLine() {
    setInvoiceForm((prev) => ({ ...prev, lines: [...prev.lines, newInvoiceLine()] }));
  }

  function removeInvoiceLine(id: string) {
    setInvoiceForm((prev) => ({
      ...prev,
      lines: prev.lines.length <= 1 ? prev.lines : prev.lines.filter((l) => l.id !== id),
    }));
  }

  async function handleInvoiceSubmit() {
    setInvoiceErr(null);
    const name    = invoiceForm.clientName.trim();
    const email   = invoiceForm.email.trim();
    const phone   = invoiceForm.phone.trim();
    const address = invoiceForm.address.trim();

    if (!name)    return setInvoiceErr("Client name is required.");
    if (!email)   return setInvoiceErr("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setInvoiceErr("Enter a valid email address.");
    if (!phone)   return setInvoiceErr("Phone is required.");
    if (!address) return setInvoiceErr("Address is required.");
    if (invoiceForm.lines.length === 0) return setInvoiceErr("Add at least one item.");

    const itemsPayload: { name: string; description: string; price: number; quantity: number }[] = [];
    for (let i = 0; i < invoiceForm.lines.length; i++) {
      const l        = invoiceForm.lines[i];
      const lineName = l.name.trim();
      const price    = Number(l.price);
      const quantity = Number(l.quantity);
      if (!lineName)                              return setInvoiceErr(`Item ${i + 1}: name is required.`);
      if (!Number.isFinite(price) || price < 0)  return setInvoiceErr(`Item ${i + 1}: enter a valid price.`);
      if (!Number.isInteger(quantity) || quantity <= 0) return setInvoiceErr(`Item ${i + 1}: quantity must be a whole number ≥ 1.`);
      itemsPayload.push({ name: lineName, description: l.description.trim(), price, quantity });
    }

    setInvoiceBusy(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("email", email);
      fd.append("address", address);
      fd.append("phone", phone);
      if (invoiceForm.notes.trim())         fd.append("notes", invoiceForm.notes.trim());
      if (invoiceForm.invoiceNumber.trim()) fd.append("invoiceNumber", invoiceForm.invoiceNumber.trim());
      if (invoiceForm.invoiceDate.trim())   fd.append("invoiceDate", invoiceForm.invoiceDate.trim());
      if (invoiceForm.dueDate.trim())       fd.append("dueDate", invoiceForm.dueDate.trim());
      if (invoiceForm.terms.trim())         fd.append("terms", invoiceForm.terms.trim());
      fd.append("items", JSON.stringify(itemsPayload));

      const res = await fetch("/api/admin/create-invoice", { method: "POST", body: fd });
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        const ct = res.headers.get("content-type");
        if (ct?.includes("application/json")) {
          try { const j = (await res.json()) as { error?: string }; if (j.error) msg = j.error; } catch {}
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = href; a.download = "invoice.pdf"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(href);
      setInvoiceMenuOpen(false);
    } catch (e) {
      setInvoiceErr(e instanceof Error ? e.message : "Could not create invoice.");
    } finally {
      setInvoiceBusy(false);
    }
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#0b081c]">
        <div className="text-center space-y-1">
          <p className="text-[#c975b9] text-xs font-bold uppercase tracking-[0.18em]">Error</p>
          <p className="text-white/50 text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 sm:px-8 py-8 space-y-5 overflow-auto min-h-screen" style={PAGE_BG}>

      {/* Modals */}
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

      {/* Header */}
      <div className="pb-4 border-b border-white/[0.125]">
        <p className="text-xs uppercase tracking-[0.22em] text-white/80 mb-1">FBX Technologies</p>
        <h1 className="text-white/75 text-2xl font-bold tracking-wide">Admin Dashboard</h1>
      </div>

      {/* Stat cards + invoice button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="grid grid-cols-3 gap-3 flex-1 min-w-0">
          <StatCard label="Enterprise"   value={loading ? "—" : String(enterprises.length).padStart(2, "0")} accent="teal"  />
          <StatCard label="Open Tickets" value={loading ? "—" : String(dbTickets.length).padStart(2, "0")}   accent="pink"  />
          <StatCard label="Orders"       value={loading ? "—" : String(dbOrders.length).padStart(2, "0")}    accent="slate" />
        </div>

        {/* Invoice button + dropdown */}
        <div className="relative shrink-0 self-stretch sm:min-w-[5.5rem]">
          <button
            type="button"
            onClick={() => { setInvoiceMenuOpen((v) => { if (!v) setInvoiceForm(emptyInvoiceForm()); return !v; }); }}
            disabled={loading}
            className="flex h-full min-h-[5.5rem] w-full flex-col items-center justify-center gap-1 rounded-lg border border-[#c975b9]/25 bg-[#c975b9]/10 px-3 py-3 text-[#c975b9] hover:bg-[#c975b9]/15 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={20} strokeWidth={2.25} />
            <span className="flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-[0.2em] leading-none">
              Invoice
              <ChevronDown size={11} className={`opacity-80 transition-transform ${invoiceMenuOpen ? "rotate-180" : ""}`} />
            </span>
          </button>

          {invoiceMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-1.5rem,26rem)] max-h-[min(85vh,36rem)] overflow-y-auto rounded-xl border border-white/[0.12] bg-[#0a0820] shadow-[0_16px_48px_rgba(0,0,0,0.55)]">
              <div className="sticky top-0 z-[1] flex items-center justify-between border-b border-white/[0.08] bg-[#0a0820]/95 px-4 py-3 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c975b9]">New invoice</span>
                <button type="button" onClick={() => setInvoiceMenuOpen(false)} className="text-white/50 hover:text-white/80 transition"><X size={16} /></button>
              </div>
              <div className="space-y-5 p-4">
                {/* Client */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Client</p>
                  {[
                    { label: "Name *",    key: "clientName" as const, type: "text",  placeholder: "Client or company name" },
                    { label: "Email *",   key: "email"      as const, type: "email", placeholder: "billing@example.com"    },
                    { label: "Phone *",   key: "phone"      as const, type: "text",  placeholder: "555-0100"               },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className={invLabelClass}>{label}</label>
                      <input type={type} value={invoiceForm[key]} onChange={(e) => setInvoiceForm((p) => ({ ...p, [key]: e.target.value }))} className={invFieldClass} placeholder={placeholder} />
                    </div>
                  ))}
                  <div>
                    <label className={invLabelClass}>Address *</label>
                    <textarea value={invoiceForm.address} onChange={(e) => setInvoiceForm((p) => ({ ...p, address: e.target.value }))} className={`${invFieldClass} min-h-[4.5rem] resize-y`} placeholder="Street, city, region, postal code" rows={2} />
                  </div>
                </div>

                {/* Invoice details */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Invoice details</p>
                  <div>
                    <label className={invLabelClass}>Invoice #</label>
                    <input value={invoiceForm.invoiceNumber} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceNumber: e.target.value }))} className={invFieldClass} placeholder="Leave blank to auto-generate" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={invLabelClass}>Invoice date</label>
                      <input type="date" value={invoiceForm.invoiceDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, invoiceDate: e.target.value }))} className={invFieldClass} />
                    </div>
                    <div>
                      <label className={invLabelClass}>Due date</label>
                      <input type="date" value={invoiceForm.dueDate} onChange={(e) => setInvoiceForm((p) => ({ ...p, dueDate: e.target.value }))} className={invFieldClass} />
                      <p className="mt-1 text-[10px] text-white/30">If empty, PDF uses one month from today.</p>
                    </div>
                  </div>
                  <div>
                    <label className={invLabelClass}>Terms</label>
                    <input value={invoiceForm.terms} onChange={(e) => setInvoiceForm((p) => ({ ...p, terms: e.target.value }))} className={invFieldClass} placeholder="Paid by the Due Date" />
                  </div>
                  <div>
                    <label className={invLabelClass}>Notes / description</label>
                    <textarea value={invoiceForm.notes} onChange={(e) => setInvoiceForm((p) => ({ ...p, notes: e.target.value }))} className={`${invFieldClass} min-h-[4rem] resize-y`} placeholder="Shown on the invoice PDF" rows={2} />
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">Items</p>
                    <button type="button" onClick={addInvoiceLine} className="flex items-center gap-1 rounded-md border border-[#c975b9]/25 bg-[#c975b9]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#c975b9] hover:bg-[#c975b9]/15 transition">
                      <Plus size={11} />Add item
                    </button>
                  </div>
                  <div className="space-y-4">
                    {invoiceForm.lines.map((line, idx) => (
                      <div key={line.id} className="space-y-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">Item {idx + 1}</span>
                          {invoiceForm.lines.length > 1 && (
                            <button type="button" onClick={() => removeInvoiceLine(line.id)} className="text-white/25 hover:text-[#c975b9] transition"><Trash2 size={14} /></button>
                          )}
                        </div>
                        <div>
                          <label className={invLabelClass}>Name *</label>
                          <input value={line.name} onChange={(e) => updateInvoiceLine(line.id, { name: e.target.value })} className={invFieldClass} placeholder="Service or product" />
                        </div>
                        <div>
                          <label className={invLabelClass}>Description</label>
                          <input value={line.description} onChange={(e) => updateInvoiceLine(line.id, { description: e.target.value })} className={invFieldClass} placeholder="Details" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={invLabelClass}>Price *</label>
                            <input inputMode="decimal" value={line.price} onChange={(e) => updateInvoiceLine(line.id, { price: e.target.value })} className={invFieldClass} placeholder="0.00" />
                          </div>
                          <div>
                            <label className={invLabelClass}>Qty *</label>
                            <input inputMode="numeric" value={line.quantity} onChange={(e) => updateInvoiceLine(line.id, { quantity: e.target.value })} className={invFieldClass} placeholder="1" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {invoiceErr && <p className="text-[#c975b9] text-xs tracking-wide">{invoiceErr}</p>}

                <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-4">
                  <button type="button" onClick={handleInvoiceSubmit} disabled={invoiceBusy} className="flex items-center gap-2 rounded-lg border border-[#c975b9]/30 bg-[#c975b9]/15 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#c975b9] hover:bg-[#c975b9]/25 transition disabled:opacity-40 disabled:cursor-not-allowed">
                    <Plus size={12} />{invoiceBusy ? "Generating…" : "Generate PDF"}
                  </button>
                  <button type="button" onClick={() => setInvoiceMenuOpen(false)} disabled={invoiceBusy} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 hover:text-white/60 transition disabled:opacity-40">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nav tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <NavTile
          href="/protected/adminDashboard/enterprises"
          icon={Building2}
          label="Enterprise Accounts"
          count={loading ? 0 : enterprises.length}
          accent={{ text: "text-[#629fcc]", bg: "bg-[#629fcc]/10", border: "border-[#629fcc]/20" }}
        />
        <NavTile
          href="/protected/adminDashboard/tickets"
          icon={TicketCheck}
          label="Support Tickets"
          count={loading ? 0 : dbTickets.length}
          accent={{ text: "text-[#c975b9]", bg: "bg-[#c975b9]/10", border: "border-[#c975b9]/20" }}
        />
        <NavTile
          href="/protected/adminDashboard/orders"
          icon={ShoppingCart}
          label="Orders in Progress"
          count={loading ? 0 : dbOrders.length}
          accent={{ text: "text-[#91bee3]", bg: "bg-[#91bee3]/10", border: "border-[#91bee3]/20" }}
        />
      </div>

      {/* Quick action: new enterprise */}
      <div className="pt-2">
        <button
          onClick={() => setCreateEnterpriseOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-[10px] font-bold uppercase tracking-[0.18em] hover:bg-[#629fcc]/15 transition"
        >
          <Plus size={12} />New Enterprise
        </button>
      </div>
    </div>
  );
}