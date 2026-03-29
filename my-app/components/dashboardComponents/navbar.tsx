"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  TicketCheck,
  Menu,
  X,
  LucideIcon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 border-b border-white/[0.04] group relative ${
        active
          ? "bg-white/[0.03] text-white/75"
          : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-0 bottom-0 w-px bg-[#e8629a]" />
      )}

      <Icon
        size={15}
        className={
          active
            ? "text-[#e8629a]"
            : "text-white/20 group-hover:text-white/40 transition-colors"
        }
      />

      <span className="text-xs uppercase tracking-[0.18em] font-medium">
        {label}
      </span>

      {active && (
        <span className="ml-auto text-[10px] text-[#e8629a]">●</span>
      )}
    </button>
  );
}

// ─── Admin Navbar ─────────────────────────────────────────────────────────────
export default function Navbar({ activePage = "dashboard" }: { activePage?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setSidebarOpen(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSidebarOpen(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const closeSidebar = () => setSidebarOpen(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-56 flex-shrink-0 bg-[#080710] border-r border-white/[0.06] flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo row */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/[0.06]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/20 mb-1">
              FBX Technologies
            </p>
            <span className="text-white/60 text-base font-light tracking-wide">
              Admin Panel
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/15 font-medium">
            Menu
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col border-t border-white/[0.04]">
          <NavItem icon={LayoutDashboard} label="Dashboard" active={activePage === "dashboard"} onClick={closeSidebar} />
        </nav>

        {/* Bottom user */}
        <div className="border-t border-white/[0.06] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#9b7fe8]/10 ring-1 ring-[#9b7fe8]/25 flex items-center justify-center text-xs font-bold tracking-widest text-[#9b7fe8] flex-shrink-0">
            M
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm text-white/50 font-medium truncate">Admin</span>
            <span className="text-xs text-white/20 truncate tracking-wide">admin@url.com</span>
          </div>
        </div>
      </aside>

      {/* ── Top Bar ── */}
      <header
        className={`
          fixed top-0 right-0 h-14 px-6
          flex items-center justify-between
          border-b border-white/[0.06] bg-[#080710] z-10
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "left-56" : "left-0"}
        `}
      >
        <div className="w-8">
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
            >
              <Menu size={16} />
            </button>
          )}
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/20 mb-0.5">
            FBX Technologies
          </p>
          <h1 className="text-white/60 text-base font-light tracking-wide">
            Admin Dashboard
          </h1>
        </div>

        <div className="w-8" />
      </header>
    </>
  );
}