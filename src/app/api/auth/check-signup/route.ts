import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Created lazily, inside the handler, instead of at module load time.
// Next.js executes route module top-level code during the build's
// page-data-collection step, before runtime-only secrets like
// SUPABASE_SERVICE_ROLE_KEY are available — so a module-level client
// here would crash the build in Docker/CI.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: Request) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          status: "error",
          message: "Email is required.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const { data, error: usersError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      return NextResponse.json(
        {
          status: "error",
          message: usersError.message,
        },
        { status: 500 }
      );
    }

    const existingUser = data.users.find(
      (user) => user.email?.toLowerCase() === normalizedEmail
    );

    if (!existingUser) {
      return NextResponse.json({
        status: "available",
        message: "Email is available.",
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        {
          status: "error",
          message: profileError.message,
        },
        { status: 500 }
      );
    }

    if (profile) {
      return NextResponse.json({
        status: "registered",
        message: "This email is already registered.",
      });
    }

    return NextResponse.json({
      status: "unverified",
      message:
        "This email is registered but not verified yet. Please check your inbox.",
    });
  } catch (error) {
    console.error("Check signup error:", error);

    return NextResponse.json(
      {
        status: "error",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}