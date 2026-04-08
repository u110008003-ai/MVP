import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";
import { getSupabaseServerClient } from "@/lib/supabase";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ProposalRow = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  status: "under_review" | "promoted";
  promoted_case_id?: string | null;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(request, "level_3");

  if (!auth.actor || auth.response) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing Supabase environment settings." },
      { status: 500 },
    );
  }

  const proposalsTable = supabase.from("proposals") as unknown as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => PromiseLike<{
          data: ProposalRow | null;
          error: { message: string } | null;
        }>;
      };
    };
    update: (values: {
      status: "promoted";
      promoted_case_id: string;
      reviewed_by: string;
    }) => {
      eq: (
        column: string,
        value: string,
      ) => PromiseLike<{ error: { message: string } | null }>;
    };
  };

  const proposalResult = await proposalsTable
    .select("id, user_id, title, content, status, promoted_case_id")
    .eq("id", id)
    .single();

  if (!proposalResult.data || proposalResult.error) {
    return NextResponse.json({ error: "Proposal not found." }, { status: 404 });
  }

  if (proposalResult.data.status === "promoted" && proposalResult.data.promoted_case_id) {
    return NextResponse.json({
      message: "Proposal has already been promoted.",
      promoted_case_id: proposalResult.data.promoted_case_id,
    });
  }

  const caseTemplate = buildCaseTemplate(
    proposalResult.data.title,
    proposalResult.data.content,
  );

  const casesTable = supabase.from("cases") as unknown as {
    insert: (values: {
      title: string;
      question: string;
      stable_conclusion: string;
      confirmed_facts: string;
      unsupported_claims: string;
      evidence_list: string;
      open_questions: string;
      status: "formal";
      created_by: string | null;
    }) => {
      select: (columns: string) => {
        single: () => PromiseLike<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };

  const caseInsertResult = await casesTable
    .insert({
      title: proposalResult.data.title,
      question: proposalResult.data.content,
      stable_conclusion: caseTemplate.stable_conclusion,
      confirmed_facts: caseTemplate.confirmed_facts,
      unsupported_claims: caseTemplate.unsupported_claims,
      evidence_list: caseTemplate.evidence_list,
      open_questions: caseTemplate.open_questions,
      status: "formal",
      created_by: proposalResult.data.user_id,
    })
    .select("id")
    .single();

  if (!caseInsertResult.data || caseInsertResult.error) {
    return NextResponse.json(
      {
        error: `Failed to create case from proposal: ${caseInsertResult.error?.message ?? "unknown error"}`,
      },
      { status: 500 },
    );
  }

  const updateResult = await proposalsTable
    .update({
      status: "promoted",
      promoted_case_id: caseInsertResult.data.id,
      reviewed_by: auth.actor.id,
    })
    .eq("id", id);

  if (updateResult.error) {
    return NextResponse.json(
      { error: `Case created, but failed to mark proposal as promoted: ${updateResult.error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    message: "Proposal promoted successfully and converted into a new case.",
    promoted_case_id: caseInsertResult.data.id,
  });
}

function buildCaseTemplate(title: string, question: string) {
  const today = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const questionSnippet = question.slice(0, 120);
  const questionTail = question.length > 120 ? "..." : "";

  return {
    stable_conclusion:
      "This proposal has been promoted to a formal case. Keep this section as a temporary conclusion until further evidence arrives.",
    confirmed_facts: [
      "- This case was created by promoting a proposal.",
      `- Original proposal title: ${title}`,
      `- Promotion date: ${today}`,
    ].join("\n"),
    unsupported_claims: [
      "- Claims below still need independent verification.",
      "- Review accepted submissions before moving these into confirmed facts.",
    ].join("\n"),
    evidence_list: [
      "- Add links and references collected from accepted submissions.",
      "- Keep each evidence entry short and traceable.",
    ].join("\n"),
    open_questions: [
      "- Which parts of the proposal can already be verified?",
      "- Which claims conflict with current evidence?",
      `- Follow-up from proposal text: ${questionSnippet}${questionTail}`,
    ].join("\n"),
  };
}
