"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  TicketCheck,
  Package,
  Star,
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

// ─── Navbar ───────────────────────────────────────────────────────────────────
/** Labels match account type; keep in sync with `lib/dashboard-routing.ts`. */
function dashboardTitle(isAdmin: boolean, role: number | null | undefined): string {
  if (isAdmin) return "Admin Dashboard";
  const r = role === null || role === undefined ? NaN : Number(role);
  if (r === 0) return "Teacher Dashboard";
  if (r === 2) return "Student Dashboard";
  return "Enterprise Dashboard";
}

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
          w-56 flex-shrink-0 bg-[#080710] border-r border-white/[0.125] flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo row */}
        <div className="px-5 py-5 flex items-center justify-between border-b border-white/[0.125]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50 mb-1">
              FBX Technologies
            </p>
            <span className="text-white font-bold tracking-wide text-base">
              {dashboardLabel}
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav section label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
            Menu
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 flex flex-col border-t border-white/[0.06]">
          {isAdmin ? (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" active={activePage === "dashboard"} href="/protected" onClick={closeSidebar} />
              <NavItem icon={User} label="Profile" active={activePage === "profile"} href="/protected/profile" onClick={closeSidebar} />
            </>
          ) : (
            <>
              <NavItem icon={LayoutDashboard} label="Dashboard" active={activePage === "dashboard"} href="/protected" onClick={closeSidebar} />
              <NavItem icon={User} label="Profile" active={activePage === "profile"} href="/protected/profile" onClick={closeSidebar} />
            </>
          )}
        </nav>

        {/* Bottom user */}
        <div className="border-t border-white/[0.125] px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#629fcc]/10 ring-1 ring-[#629fcc]/25 flex items-center justify-center text-xs font-bold tracking-widest text-[#629fcc] flex-shrink-0">
            {initials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-bold text-white truncate">
              {isAdmin ? "Admin" : (clientName ?? "Client")}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/50 truncate">
              {dashboardLabel}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-[#c975b9] transition-colors flex-shrink-0"
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
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">About</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Learn</a>
          <a href="https://example.com" target="_blank" rel="noopener noreferrer" className="font-[var(--font-montserrat),Arial,sans-serif] text-white no-underline text-[0.8rem] px-4 py-2">Enterprise</a>
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
            className="font-[var(--font-montserrat),Arial,sans-serif] px-4 py-2 text-[0.8rem] cursor-pointer rounded-full text-white no-underline"
            style={{
              border: '2px solid transparent',
              background: 'linear-gradient(#0b081c) padding-box, linear-gradient(45deg, #629fcc, #c975b9) border-box',
              filter: 'drop-shadow(1rem 0rem 1.4rem rgba(187,60,164,0.2)) drop-shadow(-1rem 0rem 1.5rem rgba(11,113,187,0.125))',
            }}
          >
            Sign In
          </a>
        </div>
      </header>
    </>
  );
}