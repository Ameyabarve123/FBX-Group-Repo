"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  ShoppingCart,
  TicketCheck,
  Menu,
  X,
  LogOut,
  User,
  LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItemProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active = false, onClick, href }: NavItemProps) {
  const content = (
    <>
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
    </>
  );

  const className = `w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 border-b border-white/[0.04] group relative ${
    active
      ? "bg-white/[0.03] text-white/75"
      : "text-white/25 hover:text-white/50 hover:bg-white/[0.02]"
  }`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function NavSectionLabel({ label }: { label: string }) {
  return (
    <div className="px-5 pt-4 pb-1.5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/15 font-medium">
        {label}
      </p>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dashboardTitle(isAdmin: boolean, role: number | null | undefined): string {
  if (isAdmin) return "Admin Dashboard";
  const r = role === null || role === undefined ? NaN : Number(role);
  if (r === 0) return "Teacher Dashboard";
  if (r === 2) return "Student Dashboard";
  return "Enterprise Dashboard";
}

function dashboardHref(isAdmin: boolean, role: number | null | undefined): string {
  if (isAdmin) return "/protected/adminDashboard";
  const r = role === null || role === undefined ? NaN : Number(role);
  if (r === 0) return "/protected/teacherDashboard";
  if (r === 1) return "/protected/studentDashboard";
  return "/protected/clientDashboard";
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar({
  activePage = "dashboard",
  isAdmin,
  clientName,
  role,
}: {
  activePage?: string;
  isAdmin: boolean;
  clientName?: string;
  role?: number | null;
}) {
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const initials = clientName
    ? clientName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "A";

  const dashboardLabel = dashboardTitle(isAdmin, role);
  const dashboardPath  = dashboardHref(isAdmin, role);

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
              {dashboardLabel}
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-white/50 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col border-t border-white/[0.04] overflow-y-auto">

          {isAdmin ? (
            <>
              <NavSectionLabel label="General" />
              <NavItem
                icon={LayoutDashboard}
                label="Overview"
                active={activePage === "dashboard"}
                href={dashboardPath}
                onClick={closeSidebar}
              />
              <NavItem
                icon={User}
                label="Profile"
                active={activePage === "profile"}
                href="/protected/profile"
                onClick={closeSidebar}
              />

              <NavSectionLabel label="Manage" />
              <NavItem
                icon={Building2}
                label="Enterprises"
                active={activePage === "enterprises"}
                href="/protected/adminDashboard/enterprises"
                onClick={closeSidebar}
              />
              <NavItem
                icon={TicketCheck}
                label="Tickets"
                active={activePage === "tickets"}
                href="/protected/adminDashboard/tickets"
                onClick={closeSidebar}
              />
              <NavItem
                icon={ShoppingCart}
                label="Orders"
                active={activePage === "orders"}
                href="/protected/adminDashboard/orders"
                onClick={closeSidebar}
              />
            </>
          ) : (
            <>
              <NavSectionLabel label="General" />
              <NavItem
                icon={LayoutDashboard}
                label="Dashboard"
                active={activePage === "dashboard"}
                href={dashboardPath}
                onClick={closeSidebar}
              />
              <NavItem
                icon={User}
                label="Profile"
                active={activePage === "profile"}
                href="/protected/profile"
                onClick={closeSidebar}
              />
            </>
          )}

        </nav>

        {/* Bottom user */}
        <div className="border-t border-white/[0.06] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-sm bg-[#9b7fe8]/10 ring-1 ring-[#9b7fe8]/25 flex items-center justify-center text-xs font-bold tracking-widest text-[#9b7fe8] flex-shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm text-white/50 font-medium truncate">
              {isAdmin ? "Admin" : (clientName ?? "Client")}
            </span>
            <span className="text-xs text-white/20 truncate tracking-wide">
              {dashboardLabel}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-8 h-8 flex items-center justify-center text-white/20 hover:text-[#e8629a] transition-colors flex-shrink-0"
          >
            <LogOut size={15} />
          </button>
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

        {/* Center nav links */}
        <div className="absolute left-1/2 -translate-x-1/2 flex gap-4 justify-center items-center">
          <a href="/" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Home</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">About</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Learn</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Enterprise</a>
          <a href="/protected" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Dashboard</a>
        </div>

        {/* Right action buttons */}
        <div className="flex gap-2 items-center">
          
            <a href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full border-2 border-transparent bg-white text-black no-underline"
          >
            Contact Us
          </a>
          
            <a href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { e.preventDefault(); handleLogout(); }}
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full text-white no-underline"
            style={{
              border: '2px solid transparent',
              background: 'linear-gradient(#0b081c) padding-box, linear-gradient(45deg, #629fcc, #c975b9) border-box',
              filter: 'drop-shadow(1rem 0rem 1.4rem rgba(187,60,164,0.2)) drop-shadow(-1rem 0rem 1.5rem rgba(11,113,187,0.125))',
            }}
          >
            Sign Out
          </a>
        </div>
      </header>
    </>
  );
}