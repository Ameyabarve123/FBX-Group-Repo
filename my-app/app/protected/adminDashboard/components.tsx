"use client";

import { type LucideIcon } from "lucide-react";

export function getInitials(name: string): string {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export const ACCENTS = {
  pink:   { text: "text-[#FF6996]", bg: "bg-[#FF6996]/10" },
  violet: { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10" },
  slate:  { text: "text-[#91bee3]", bg: "bg-[#91bee3]/10" },
  teal:   { text: "text-[#629fcc]", bg: "bg-[#629fcc]/10" },
};

export function Avatar({ initials, color = "pink" }: { initials: string; color?: keyof typeof ACCENTS }) {
  const styles: Record<keyof typeof ACCENTS, string> = {
    pink:   "bg-[#FF6996]/10 text-[#FF6996] ring-1 ring-[#FF6996]/25",
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

export function StatCard({ label, value, accent = "violet" }: { label: string; value: string; accent?: keyof typeof ACCENTS }) {
  const a = ACCENTS[accent];
  return (
    <div className="relative bg-[#0d0b1e] rounded-lg border border-white/[0.125] p-5 overflow-hidden hover:border-white/100 transition-colors duration-300">
      <p className="text-xs uppercase tracking-[0.18em] text-white/100 font-medium mb-3">{label}</p>
      <p className={`text-4xl font-bold ${a.text} tabular-nums`}>{value}</p>
    </div>
  );
}

export function SectionCard({
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
          <h2 className="text-white/100 text-xs font-bold uppercase tracking-[0.18em]">{title}</h2>
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

export function TableHeader({ cols }: { cols: string[] }) {
  return (
    <div
      className="hidden sm:grid px-5 py-3 border-b border-white/[0.04]"
      style={{ gridTemplateColumns: `repeat(${cols.length}, 1fr)` }}
    >
      {cols.map((c) => (
        <span key={c} className="text-[11px] uppercase tracking-[0.18em] text-white/100 font-bold">{c}</span>
      ))}
    </div>
  );
}

export function LoadingRow() {
  return (
    <div className="px-5 py-4 flex items-center gap-3 animate-pulse border-b border-white/[0.04]">
      <div className="w-10 h-10 rounded-lg bg-white/100 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-white/100 rounded w-1/3" />
        <div className="h-2.5 bg-white/100 rounded w-1/5" />
      </div>
    </div>
  );
}

export function EmptyRow({ message }: { message: string }) {
  return (
    <div className="px-5 py-8 text-center text-white/100 text-xs tracking-[0.18em] uppercase">
      {message}
    </div>
  );
}

export const PAGE_BG: React.CSSProperties = {
  background: 'linear-gradient(0deg, #000000 80%, #1a0f2e 87%, #223079 100%)',
};