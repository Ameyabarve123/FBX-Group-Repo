import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name:     string;
      email:    string;
      password: string;
    };

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "name, email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // ── 0. Save current admin session ─────────────────────────────────────────
    const { data: { session: adminSession } } = await supabase.auth.getSession();
    if (!adminSession) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // ── 1. Sign up new user ───────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create account" },
        { status: 400 }
      );
    }

    const userUuid = authData.user.id;

    // ── 2. Immediately restore admin session ──────────────────────────────────
    await supabase.auth.setSession({
      access_token:  adminSession.access_token,
      refresh_token: adminSession.refresh_token,
    });

    // ── 3. Update the row the trigger already created ─────────────────────────
    const { error: updateError } = await supabase
      .from("users")
      .update({ client_name: name, role: 3, is_admin: 0 })
      .eq("user_uuid", userUuid);

    if (updateError) {
      return NextResponse.json(
        { error: `Profile setup failed: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("create-enterprise error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}