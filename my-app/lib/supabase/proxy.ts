import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getDashboardPathForUser, type DashboardUser } from "@/lib/dashboard-routing";
import { hasEnvVars } from "../utils";

function isDashboardPath(pathname: string): boolean {
  return (
    pathname.startsWith("/protected/adminDashboard") ||
    pathname.startsWith("/protected/teacherDashboard") ||
    pathname.startsWith("/protected/studentDashboard") ||
    pathname.startsWith("/protected/clientDashboard")
  );
}

function redirectPreservingSession(
  request: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirectResponse = NextResponse.redirect(url);
  for (const c of supabaseResponse.cookies.getAll()) {
    redirectResponse.cookies.set(c.name, c.value);
  }
  return redirectResponse;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as { sub?: string } | undefined;
  const user = data?.claims;
  const pathname = request.nextUrl.pathname;

  const isProtected = pathname.startsWith("/protected");

  if (isProtected && !user) {
    return redirectPreservingSession(request, "/auth/login", supabaseResponse);
  }

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    if (!user) {
      url.pathname = "/auth/login";
    } else {
      const { data: dbUser } = await supabase
        .from("users")
        .select("is_admin, role")
        .eq("user_uuid", claims?.sub ?? "")
        .maybeSingle<DashboardUser>();

      url.pathname = getDashboardPathForUser(dbUser ?? { is_admin: 0 });
    }
    const redirectResponse = NextResponse.redirect(url);
    for (const c of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(c.name, c.value);
    }
    return redirectResponse;
  }

  if (user && claims?.sub && isProtected) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("is_admin, role")
      .eq("user_uuid", claims.sub)
      .maybeSingle<DashboardUser>();

    const dashboardPath = getDashboardPathForUser(dbUser ?? { is_admin: 0 });

    if (pathname.startsWith("/protected/profile")) {
      return supabaseResponse;
    }

    if (pathname === "/protected" || pathname === "/protected/") {
      return redirectPreservingSession(request, dashboardPath, supabaseResponse);
    }

    if (isDashboardPath(pathname) && !pathname.startsWith(dashboardPath)) {
      return redirectPreservingSession(request, dashboardPath, supabaseResponse);
    }
  }

  if (user && (pathname === "/auth/login" || pathname === "/auth/sign-up")) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("is_admin, role")
      .eq("user_uuid", claims?.sub ?? "")
      .maybeSingle<DashboardUser>();

    const dashboardPath = getDashboardPathForUser(dbUser ?? { is_admin: 0 });
    return redirectPreservingSession(request, dashboardPath, supabaseResponse);
  }

  return supabaseResponse;
}
