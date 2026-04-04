"use client";

import { useState } from "react";
import { Building2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CreateEnterpriseModalProps {
  onClose: () => void;
  onCreated: (name: string, email: string, password: string) => void;
}

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

export default function CreateEnterpriseModal({ onClose, onCreated }: CreateEnterpriseModalProps) {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState(generatePassword());
  const [submitting, setSubmitting] = useState(false);
  const [err,        setErr]        = useState<string | null>(null);

  async function handleCreate() {
  if (!name || !email || !password) return;
  setSubmitting(true);
  setErr(null);

  try {
    // Get the current session token
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) throw new Error("Not authenticated");

    const res = await fetch("/api/admin/create-enterprise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,  // <-- attach token
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(body.error ?? "Failed to create account");
    }

    onCreated(name, email, password);
    onClose();
  } catch (e: unknown) {
    setErr(e instanceof Error ? e.message : "Something went wrong");
  } finally {
    setSubmitting(false);
  }
}

  const fieldClass =
    "w-full bg-[#080710] border border-white/[0.06] px-4 py-3 text-sm text-white/60 " +
    "placeholder:text-white/15 outline-none focus:border-white/10 transition font-mono";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 size={14} className="text-[#4ecdc4]" />
            <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
              Create Enterprise Account
            </span>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition">
            <X size={16} />
          </button>
        </div>

        {/* Account details */}
        <div className="space-y-3">
          {(
            [
              { label: "Company / Contact Name", value: name,     setter: setName,     placeholder: "e.g. Acme Corp",         type: "text"  },
              { label: "Email",                  value: email,    setter: setEmail,    placeholder: "e.g. admin@acmecorp.com", type: "email" },
              { label: "Password",               value: password, setter: setPassword, placeholder: "Auto-generated",         type: "text"  },
            ] as const
          ).map(({ label, value, setter, placeholder, type }) => (
            <div key={label}>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{label}</p>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={placeholder}
                className={fieldClass}
              />
            </div>
          ))}
        </div>

        <p className="text-white/20 text-[11px]">
          Plan details can be added after creation by clicking the enterprise row.
        </p>

        {err && <p className="text-[#e8629a] text-xs">{err}</p>}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setPassword(generatePassword())}
            className="text-[10px] uppercase tracking-[0.18em] text-white/20 hover:text-white/40 transition px-3 py-2 border border-white/[0.06] hover:border-white/10 flex-shrink-0"
          >
            Regenerate
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-white/[0.06] text-white/25 text-xs uppercase tracking-[0.18em] hover:border-white/10 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!name || !email || !password || submitting}
            className="flex-1 py-2.5 bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-xs uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}