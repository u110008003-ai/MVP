import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/server-auth";
import { getSupabaseServerClientForToken } from "@/lib/supabase";

type ProposalOwnerRow = {
  id: string;
};

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);

  if (!auth.actor || auth.response) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabaseServerClientForToken(auth.actor.access_token);

  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing Supabase environment settings." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("proposals")
    .select("id")
    .eq("user_id", auth.actor.id);

  if (error) {
    return NextResponse.json(
      { error: `Failed to read your proposals: ${error.message}` },
      { status: 500 },
    );
  }

  const proposalIds = (data ?? []).map((item) => (item as ProposalOwnerRow).id);

  return NextResponse.json({
    proposalIds,
  });
}
