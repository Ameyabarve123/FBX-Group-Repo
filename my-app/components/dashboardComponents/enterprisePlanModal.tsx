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
    "w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 " +
    "placeholder:text-white/15 outline-none focus:border-[#4ecdc4]/20 transition font-mono";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70" onClick={onClose}>
      <div className="flex min-h-full items-center justify-center p-8">
        <div
          className="relative w-full max-w-2xl bg-[#0d0c14] border border-white/[0.06]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-10 py-8 border-b border-white/[0.06] flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-white/20 font-medium mb-2">
                Enterprise Account
              </p>
              <h2 className="text-white/75 text-3xl font-light tracking-wide">
                {enterprise.client_name}
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-[#4ecdc4] transition"
                  title="Edit plan"
                >
                  <Pencil size={15} />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center text-white/20 hover:text-white/50 transition"
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
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">Description</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`${fieldClass} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">Price (USD)</p>
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
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">Robots Allocated</p>
                    <input
                      type="number"
                      min={0}
                      value={robotsTotal}
                      onChange={(e) => setRobotsTotal(e.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">Robots Shipped</p>
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
                    <Building2 size={15} className="text-[#4ecdc4]" />
                    <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Plan</p>
                  </div>
                  <p className="text-white/50 text-base leading-relaxed pl-7">
                    {plan.description || <span className="text-white/20 italic">No description</span>}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign size={15} className="text-[#e8629a]" />
                    <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">Price</p>
                  </div>
                  <p className="text-white/70 text-lg font-medium pl-7">
                    ${plan.price.toLocaleString()}
                  </p>
                </div>

                {/* Robot deployment */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Bot size={15} className="text-[#9b7fe8]" />
                    <p className="text-sm uppercase tracking-[0.2em] text-white/20 font-medium">
                      Robot Deployment
                    </p>
                  </div>
                  <div className="pl-7 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">Shipped</span>
                      <span className="text-white/70 tabular-nums">
                        <span className="text-[#4ecdc4]">{plan.robots_shipped ?? 0}</span>
                        <span className="text-white/20 mx-1">/</span>
                        <span>{plan.robots_allocated ?? 0}</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] w-full overflow-hidden">
                      <div
                        className="h-full bg-[#4ecdc4] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PackageCheck size={11} className="text-[#4ecdc4]" />
                        <span className="text-[11px] text-white/25 tracking-wider">{pct}% deployed</span>
                      </div>
                      <span className="text-[11px] text-white/20">
                        {(plan.robots_allocated ?? 0) - (plan.robots_shipped ?? 0)} remaining
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-white/20 text-sm">
                No plan assigned yet.{" "}
                <button
                  onClick={() => setEditing(true)}
                  className="text-[#4ecdc4] underline underline-offset-2"
                >
                  Add one
                </button>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="px-10 pb-10 border-t border-white/[0.06] pt-6 flex gap-3">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-3 text-white/30 text-xs uppercase tracking-[0.2em] hover:text-white/60 border border-white/[0.06] transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 flex items-center justify-center gap-2 bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-xs uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition disabled:opacity-40"
                >
                  <Save size={12} />
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full py-4 text-white/30 text-sm uppercase tracking-[0.2em] hover:text-white/60 hover:bg-white/[0.02] border border-white/[0.06] transition-colors duration-150"
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