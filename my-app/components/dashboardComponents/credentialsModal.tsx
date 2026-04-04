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
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/20 mb-1.5">{label}</p>
      <div className="flex items-center justify-between gap-3 bg-[#080710] border border-white/[0.06] px-4 py-3">
        <span className="text-sm text-white/60 font-mono truncate">{value}</span>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 text-white/20 hover:text-[#9b7fe8] transition-colors"
        >
          {copied ? <Check size={13} className="text-[#9b7fe8]" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
}

export default function CredentialsModal({ name, email, password, onClose }: CredentialsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#080710]/90 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-[#0d0c14] border border-white/[0.08] p-6 max-w-sm w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <Building2 size={14} className="text-[#4ecdc4]" />
          <span className="text-white/50 text-xs uppercase tracking-[0.18em] font-medium">
            Enterprise Account Created
          </span>
        </div>
        <p className="text-white/25 text-xs leading-relaxed">
          Share these credentials with the enterprise contact. The password will not be shown again.
        </p>
        <div className="space-y-3">
          <CopyField label="Name"     value={name}     />
          <CopyField label="Email"    value={email}    />
          <CopyField label="Password" value={password} />
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#4ecdc4]/10 border border-[#4ecdc4]/20 text-[#4ecdc4] text-xs uppercase tracking-[0.18em] hover:bg-[#4ecdc4]/15 transition"
        >
          Done
        </button>
      </div>
    </div>
  );
}