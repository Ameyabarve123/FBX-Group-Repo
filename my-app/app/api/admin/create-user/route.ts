import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // 1. Create the auth user — same as signup form
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Failed to create auth user" }, { status: 400 });
    }

    // 2. Upsert into public.users with role = 3 (enterprise)
    const { error: dbError } = await supabase.from("users").upsert({
      client_name: name,
      user_uuid: authData.user.id,
      is_admin: 0,
      role: 3,
    }, { onConflict: "user_uuid" });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}