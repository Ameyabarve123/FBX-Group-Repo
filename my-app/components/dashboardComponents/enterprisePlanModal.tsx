"use client";

import { useState } from "react";
import { Building2, Bot, DollarSign, PackageCheck, Pencil, X, Save } from "lucide-react";
import type { DBUser, DBPlan } from "./types";

interface EnterprisePlanModalProps {
  enterprise: DBUser;
  plan: DBPlan | undefined;
  onClose: () => void;
  onSave: (updated: Partial<DBPlan>) => Promise<void>;
}

export default function EnterprisePlanModal({
  enterprise,
  plan,
  onClose,
  onSave,
}: EnterprisePlanModalProps) {
  const [editing,       setEditing]       = useState(false);
  const [description,   setDescription]   = useState(plan?.description        ?? "");
  const [price,         setPrice]         = useState(String(plan?.price       ?? ""));
  const [robotsTotal,   setRobotsTotal]   = useState(String(plan?.robots_allocated ?? 0));
  const [robotsShipped, setRobotsShipped] = useState(String(plan?.robots_shipped   ?? 0));
  const [saving,        setSaving]        = useState(false);

  const shipped = parseInt(robotsShipped, 10) || 0;
  const total   = parseInt(robotsTotal,   10) || 0;
  const pct     = total > 0 ? Math.min(100, Math.round((shipped / total) * 100)) : 0;

  async function handleSave() {
    setSaving(true);
    await onSave({
      description,
      price:            parseFloat(price),
      robots_allocated: parseInt(robotsTotal,   10),
      robots_shipped:   parseInt(robotsShipped, 10),
    });
    setSaving(false);
    setEditing(false);
  }

  const fieldClass =
    "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/70 " +
    "placeholder:text-white/50 outline-none hover:border-white/[0.14] focus:border-[#91bee3]/40 transition font-mono";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-8">
        <div
          className="relative w-full max-w-2xl bg-[#0d0b1e] border border-white/[0.125] rounded-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-10 py-8 border-b border-white/[0.125] flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-white/50 mb-2">
                Enterprise Account
              </p>
              <h2 className="text-white/75 text-3xl font-bold tracking-wide">
                {enterprise.client_name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-[#629fcc] transition"
                  title="Edit plan"
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white/50 transition"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-10 py-9 space-y-8">
            {editing ? (
              /* ── Edit mode ── */
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">Description</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`${fieldClass} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">Price (USD)</p>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">Robots Allocated</p>
                    <input
                      type="number"
                      min={0}
                      value={robotsTotal}
                      onChange={(e) => setRobotsTotal(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">Robots Shipped</p>
                    <input
                      type="number"
                      min={0}
                      value={robotsShipped}
                      onChange={(e) => setRobotsShipped(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              </div>
            ) : plan ? (
              /* ── Read mode ── */
              <>
                {/* Description */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Building2 size={15} className="text-[#629fcc]" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">Plan</p>
                  </div>
                  <p className="text-white/50 text-base leading-relaxed pl-7">
                    {plan.description || <span className="text-white/20 italic">No description</span>}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign size={15} className="text-[#c975b9]" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">Price</p>
                  </div>
                  <p className="text-white/70 text-lg font-bold pl-7">
                    ${plan.price.toLocaleString()}
                  </p>
                </div>

                {/* Robot deployment */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Bot size={15} className="text-[#91bee3]" />
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/50">
                      Robot Deployment
                    </p>
                  </div>
                  <div className="pl-7 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">Shipped</span>
                      <span className="text-white/70 tabular-nums">
                        <span className="text-[#629fcc]">{plan.robots_shipped ?? 0}</span>
                        <span className="text-white/20 mx-1">/</span>
                        <span>{plan.robots_allocated ?? 0}</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] w-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#629fcc] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageCheck size={11} className="text-[#629fcc]" />
                        <span className="text-[11px] text-white/50 tracking-wider">{pct}% deployed</span>
                      </div>
                      <span className="text-[11px] text-white/50">
                        {(plan.robots_allocated ?? 0) - (plan.robots_shipped ?? 0)} remaining
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/50 text-sm">
                No plan assigned yet.{" "}
                <button
                  onClick={() => setEditing(true)}
                  className="text-[#629fcc] underline underline-offset-2"
                >
                  Add one
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-10 pb-10 border-t border-white/[0.125] pt-6 flex gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 rounded-lg text-white/80 text-xs font-bold uppercase tracking-[0.2em] hover:text-white/50 border border-white/[0.08] hover:border-white/[0.14] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-lg flex items-center justify-center gap-2 bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#629fcc]/15 transition disabled:opacity-40"
                >
                  <Save size={12} />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-4 rounded-lg text-white/80 text-sm font-bold uppercase tracking-[0.2em] hover:text-white/50 hover:bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.14] transition-colors duration-150"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}