"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  TicketCheck,
  Bell,
  Settings,
  Menu,
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
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? "bg-[#F97B8B]/15 text-[#F97B8B]"
          : "text-[#8b8099] hover:text-[#e8e0ee] hover:bg-white/5"
      }`}
    >
      <Icon size={18} className={active ? "text-[#F97B8B]" : "group-hover:text-[#e8e0ee]"} />
      <span>{label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#F97B8B]" />}
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
      {/* ── Mobile backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30
          w-56 flex-shrink-0 bg-[#0f0e1a] border-r border-white/5 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo row — hamburger replaces the X, lives here */}
        <div className="px-4 py-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F97B8B] flex items-center justify-center flex-shrink-0">
              <LayoutDashboard size={16} className="text-[#1a1a2e]" />
            </div>
            <span className="font-bold text-[#e8e0ee] tracking-wide text-sm">AdminPanel</span>
          </div>
          {/* Hamburger closes the sidebar */}
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8b8099] hover:text-[#e8e0ee] hover:bg-white/5 transition flex-shrink-0"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[#4a4560] text-[10px] uppercase tracking-widest font-bold px-4 mb-2">
            Menu
          </p>
          <NavItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={activePage === "dashboard"}
            onClick={closeSidebar}
          />
          <NavItem
            icon={Users}
            label="Customers"
            active={activePage === "customers"}
            onClick={closeSidebar}
          />
          <NavItem
            icon={TicketCheck}
            label="Support"
            active={activePage === "support"}
            onClick={closeSidebar}
          />
          <NavItem
            icon={ShoppingCart}
            label="Orders"
            active={activePage === "orders"}
            onClick={closeSidebar}
          />
        </nav>

        {/* Bottom user */}
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 cursor-pointer transition">
            <div className="w-8 h-8 rounded-lg bg-[#7B93F9]/20 flex items-center justify-center text-[#7B93F9] font-bold text-xs flex-shrink-0">
              M
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#e8e0ee] truncate">Admin</span>
              <span className="text-[10px] text-[#8b8099] truncate">admin@url.com</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Top Bar ── */}
      <header
        className={`
          fixed top-0 right-0 h-14 px-4 sm:px-6
          flex items-center justify-between
          border-b border-white/5 bg-[#12111d] z-10
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "left-56" : "left-0"}
        `}
      >
        {/* Left — hamburger when sidebar closed, empty spacer when open */}
        <div className="w-8">
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8b8099] hover:text-[#e8e0ee] hover:bg-white/5 transition"
            >
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Center — absolutely centered in the header */}
        <h1 className="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-bold tracking-wide text-[#e8e0ee]">
          Admin Homepage
        </h1>
      </header>
    </>
  );
}