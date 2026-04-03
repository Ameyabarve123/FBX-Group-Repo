"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./navbar";
import { createClient } from "@/lib/supabase/client";

interface DbUser {
  client_name?: string;
  is_admin?: number;
}

export default function NavbarWithUser() {
  const pathname = usePathname();
  const [dbUser, setDbUser] = useState<DbUser | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("users")
          .select("client_name, is_admin")
          .eq("user_uuid", user.id)
          .single();
        setDbUser(data);
      }
    };

    fetchUserData();
  }, []);

  // Determine active page based on pathname
  let activePage = "dashboard";
  if (pathname.includes("/profile")) {
    activePage = "profile";
  } else if (pathname.includes("/admin")) {
    activePage = "admin";
  } else if (pathname.includes("/client")) {
    activePage = "client";
  }

  return (
    <Navbar
      activePage={activePage}
      isAdmin={dbUser?.is_admin === 1}
      clientName={dbUser?.client_name ?? undefined}
    />
  );
}
