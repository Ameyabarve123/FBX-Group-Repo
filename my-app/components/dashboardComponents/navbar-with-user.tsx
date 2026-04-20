"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Navbar from "./navbar";
import { createClient } from "@/lib/supabase/client";

interface DbUser {
  client_name?: string;
  is_admin?: number;
  role?: number | null;
}

/** Until `users` loads, infer labels from the dashboard URL (proxy may redirect before fetch). */
function inferFromPath(pathname: string): {
  isAdmin: boolean;
  role: number | null | undefined;
} | null {
  if (pathname.includes("/adminDashboard")) {
    return { isAdmin: true, role: undefined };
  }
  if (pathname.includes("/teacherDashboard")) {
    return { isAdmin: false, role: 0 };
  }
  if (pathname.includes("/studentDashboard")) {
    return { isAdmin: false, role: 1 };
  }
  if (pathname.includes("/clientDashboard")) {
    return { isAdmin: false, role: 2 };
  }
  return null;
}

function numericRole(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export default function NavbarWithUser() {
  const pathname = usePathname();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  /** Keeps teacher/student/client labels on `/protected/profile` when `users.role` is missing in DB. */
  const lastDashboardRef = useRef<{ isAdmin: boolean; role?: number }>({
    isAdmin: false,
    role: undefined,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("client_name, is_admin, role")
          .eq("user_uuid", user.id)
          .single();
        setDbUser(data);
      }
    };

    fetchUserData();
  }, []);

  // Determine active page — sub-routes must be checked before their parent
  let activePage = "dashboard";
  if (pathname.includes("/profile")) {
    activePage = "profile";
  } else if (pathname.includes("/adminDashboard/enterprises")) {
    activePage = "enterprises";
  } else if (pathname.includes("/adminDashboard/tickets")) {
    activePage = "tickets";
  } else if (pathname.includes("/adminDashboard/orders")) {
    activePage = "orders";
  } else if (pathname.includes("/adminDashboard")) {
    activePage = "dashboard";
  } else if (pathname.includes("/client")) {
    activePage = "client";
  }

  const inferred = inferFromPath(pathname);
  if (inferred) {
    lastDashboardRef.current = {
      isAdmin: inferred.isAdmin,
      role:
        inferred.role === null || inferred.role === undefined
          ? undefined
          : Number(inferred.role),
    };
  }

  const isAdmin =
    dbUser != null
      ? Number(dbUser.is_admin) === 1
      : Boolean(inferred?.isAdmin || lastDashboardRef.current.isAdmin);

  const dbRole = dbUser != null ? numericRole(dbUser.role) : undefined;
  const inferredRole =
    inferred?.role === null || inferred?.role === undefined
      ? undefined
      : Number(inferred.role);
  const role =
    dbRole !== undefined
      ? dbRole
      : inferredRole !== undefined
        ? inferredRole
        : lastDashboardRef.current.role;

  return (
    <Navbar
      activePage={activePage}
      isAdmin={isAdmin}
      clientName={dbUser?.client_name ?? undefined}
      role={role}
    />
  );
}