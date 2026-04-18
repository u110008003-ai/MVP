import { NextResponse } from "next/server";
import { SERVER_SESSION_COOKIE } from "@/lib/auth-constants";
import { getSupabaseServerClient, getSupabaseServerClientForToken } from "@/lib/supabase";
import type { ProfileRecord } from "@/lib/types";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

export async function GET(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return NextResponse.json(
      {
        code: "auth_token_missing",
        error: "Missing Authorization Bearer token.",
      },
      { status: 401 },
    );
  }

  const supabase = getSupabaseServerClient();
  const actorSupabase = getSupabaseServerClientForToken(token);

  if (!supabase || !actorSupabase) {
    return NextResponse.json(
      { error: "Server is missing Supabase environment settings." },
      { status: 500 },
    );
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json(
      {
        code: "auth_token_invalid",
        error: "Invalid or expired login token. Please sign in again.",
      },
      { status: 401 },
    );
  }

  const email = authData.user.email ?? "";
  const fallbackName = authData.user.user_metadata?.display_name ?? email.split("@")[0] ?? "new-user";

  const profilesTable = actorSupabase.from("profiles") as unknown as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => PromiseLike<{ data: ProfileRecord | null; error: { message: string } | null }>;
      };
    };
    upsert: (
      values: {
        id: string;
        email: string;
        display_name: string;
      },
      options: { onConflict: string },
    ) => PromiseLike<{ error: { message: string } | null }>;
  };

  const existingProfileResult = await profilesTable
    .select("id, email, display_name, role, created_at")
    .eq("id", authData.user.id)
    .single();

  let profile = existingProfileResult.data;

  if (!profile || existingProfileResult.error) {
    const upsertResult = await profilesTable.upsert(
      {
        id: authData.user.id,
        email,
        display_name: fallbackName,
      },
      { onConflict: "id" },
    );

    if (upsertResult.error) {
      return NextResponse.json(
        {
          code: "profile_sync_failed",
          error: `Unable to sync your profile: ${upsertResult.error.message}`,
        },
        { status: 500 },
      );
    }

    const profileResult = await profilesTable
      .select("id, email, display_name, role, created_at")
      .eq("id", authData.user.id)
      .single();

    if (!profileResult.data || profileResult.error) {
      return NextResponse.json(
        {
          code: "profile_not_found",
          error: "Unable to read your profile after sync.",
        },
        { status: 500 },
      );
    }

    profile = profileResult.data;
  }

  const response = NextResponse.json({ profile });
  response.cookies.set(SERVER_SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
