"use client";

import { useState } from "react";
import { Building2, Check, Copy } from "lucide-react";

interface CredentialsModalProps {
  name: string;
  email: string;
  password: string;
  onClose: () => void;
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 mb-1.5">{label}</p>
      <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 hover:border-white/[0.14] transition">
        <span className="text-sm text-white/70 font-mono truncate">{value}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-white/50 hover:text-[#629fcc] transition-colors"
        >
          {copied ? <Check size={13} className="text-[#629fcc]" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function CredentialsModal({ name, email, password, onClose }: CredentialsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0b1e] border border-white/[0.125] rounded-lg p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Building2 size={14} className="text-[#629fcc]" />
          <span className="text-white/50 text-xs font-bold uppercase tracking-[0.18em]">
            Enterprise Account Created
          </span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed">
          Share these credentials with the enterprise contact. The password will not be shown again.
        </p>
        <div className="space-y-3">
          <CopyField label="Name"     value={name}     />
          <CopyField label="Email"    value={email}    />
          <CopyField label="Password" value={password} />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-lg bg-[#629fcc]/10 border border-[#629fcc]/20 text-[#629fcc] text-xs font-bold uppercase tracking-[0.18em] hover:bg-[#629fcc]/15 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}