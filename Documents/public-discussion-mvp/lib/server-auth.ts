import { cookies } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { SERVER_SESSION_COOKIE } from "@/lib/auth-constants";
import { roleMeetsRequirement } from "@/lib/roles";
import { getSupabaseServerClient, getSupabaseServerClientForToken } from "@/lib/supabase";
import type { ProfileRecord, UserRole } from "@/lib/types";

export type RequestActor = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  access_token: string;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length).trim();
  return token || null;
}

async function loadActorFromAccessToken(accessToken: string) {
  const supabase = getSupabaseServerClient();
  const actorSupabase = getSupabaseServerClientForToken(accessToken);

  if (!supabase || !actorSupabase) {
    return {
      actor: null,
      error: {
        code: "supabase_config_missing",
        message: "Server is missing Supabase environment settings.",
        status: 500,
      },
    };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return {
      actor: null,
      error: {
        code: "auth_token_invalid",
        message: "Invalid or expired login token. Please sign in again.",
        status: 401,
      },
    };
  }

  const profilesTable = actorSupabase.from("profiles") as unknown as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => PromiseLike<{ data: ProfileRecord | null; error: { message: string } | null }>;
      };
    };
  };

  const profileResult = await profilesTable
    .select("id, email, display_name, role, created_at")
    .eq("id", authData.user.id)
    .single();

  if (profileResult.error || !profileResult.data) {
    return {
      actor: null,
      error: {
        code: "profile_not_found",
        message: "Unable to read your profile role. Please refresh and try again.",
        status: 403,
      },
    };
  }

  return {
    actor: {
      id: profileResult.data.id,
      email: profileResult.data.email,
      display_name: profileResult.data.display_name,
      role: profileResult.data.role,
      access_token: accessToken,
    } satisfies RequestActor,
    error: null,
  };
}

export async function authenticateRequest(request: Request) {
  const token = getBearerToken(request);

  if (!token) {
    return {
      actor: null,
      response: NextResponse.json(
        {
          code: "auth_token_missing",
          error: "Missing Authorization Bearer token.",
        },
        { status: 401 },
      ),
    };
  }

  const authResult = await loadActorFromAccessToken(token);

  if (!authResult.actor || authResult.error) {
    return {
      actor: null,
      response: NextResponse.json(
        {
          code: authResult.error?.code ?? "auth_failed",
          error: authResult.error?.message ?? "Unable to authenticate request.",
        },
        { status: authResult.error?.status ?? 401 },
      ),
    };
  }

  return {
    actor: authResult.actor,
    response: null,
  };
}

export async function requireRole(request: Request, requiredRole: UserRole) {
  const authResult = await authenticateRequest(request);

  if (!authResult.actor || authResult.response) {
    return authResult;
  }

  if (!roleMeetsRequirement(authResult.actor.role, requiredRole)) {
    return {
      actor: null,
      response: NextResponse.json(
        {
          code: "insufficient_role",
          error: `Insufficient role. This action requires ${requiredRole}.`,
        },
        { status: 403 },
      ),
    };
  }

  return authResult;
}

export async function getServerActorFromCookie() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SERVER_SESSION_COOKIE)?.value ?? null;

  if (!accessToken) {
    return null;
  }

  const authResult = await loadActorFromAccessToken(accessToken);
  return authResult.actor;
}

export async function requirePageRole(requiredRole: UserRole) {
  const actor = await getServerActorFromCookie();

  if (!actor) {
    redirect("/");
  }

  if (!roleMeetsRequirement(actor.role, requiredRole)) {
    forbidden();
  }

  return actor;
}
