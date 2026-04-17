import { NextResponse } from "next/server";
import { SERVER_SESSION_COOKIE } from "@/lib/auth-constants";
import { authenticateRequest } from "@/lib/server-auth";

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function POST(request: Request) {
  const auth = await authenticateRequest(request);

  if (!auth.actor || auth.response) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const response = NextResponse.json({ message: "Server session synced." });
  response.cookies.set(SERVER_SESSION_COOKIE, auth.actor.access_token, sessionCookieOptions);
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Server session cleared." });
  response.cookies.set(SERVER_SESSION_COOKIE, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
  return response;
}
