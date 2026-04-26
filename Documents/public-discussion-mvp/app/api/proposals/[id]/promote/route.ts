import { NextResponse } from "next/server";
import {
  combineNarrativeSides,
  isStructuredProposalContent,
  parseProposalDraft,
} from "@/lib/proposal-draft";
import { requireRole } from "@/lib/server-auth";
import { getSupabaseServerClientForToken } from "@/lib/supabase";

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
  const supabase = getSupabaseServerClientForToken(auth.actor.access_token);

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

  const caseTemplate = buildCaseTemplate(proposalResult.data.title, proposalResult.data.content);

  const casesTable = supabase.from("cases") as unknown as {
    insert: (values: {
      title: string;
      question: string;
      narrative_timeline: string;
      narrative_side_a: string;
      narrative_side_b: string;
      stable_conclusion: string;
      confirmed_facts: string;
      possible_explanations: string;
      unsupported_claims: string;
      evidence_list: string;
      reference_links: string;
      open_questions: string;
      summary_image_url: string;
      summary_image_note: string;
      status: "formal";
      created_by: string | null;
      promoted_by: string;
    }) => {
      select: (columns: string) => {
        single: () => PromiseLike<{ data: { id: string } | null; error: { message: string } | null }>;
      };
    };
  };

  const caseInsertResult = await casesTable
    .insert({
      title: proposalResult.data.title,
      question: caseTemplate.question,
      narrative_timeline: caseTemplate.narrative_timeline,
      narrative_side_a: caseTemplate.narrative_side_a,
      narrative_side_b: caseTemplate.narrative_side_b,
      stable_conclusion: caseTemplate.stable_conclusion,
      confirmed_facts: caseTemplate.confirmed_facts,
      possible_explanations: caseTemplate.possible_explanations,
      unsupported_claims: caseTemplate.unsupported_claims,
      evidence_list: caseTemplate.evidence_list,
      reference_links: caseTemplate.reference_links,
      open_questions: caseTemplate.open_questions,
      summary_image_url: "",
      summary_image_note: caseTemplate.summary_image_note,
      status: "formal",
      created_by: proposalResult.data.user_id,
      promoted_by: auth.actor.id,
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

function buildCaseTemplate(title: string, content: string) {
  const today = new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  if (isStructuredProposalContent(content)) {
    const draft = parseProposalDraft(content);

    return {
      question: draft.question || title,
      narrative_timeline: combineNarrativeSides(draft.narrativeSideA, draft.narrativeSideB),
      narrative_side_a: draft.narrativeSideA,
      narrative_side_b: draft.narrativeSideB,
      stable_conclusion:
        draft.conclusion ||
        "這份提案已被升格為正式案件。這裡先保留暫定結論，等待後續證據補強。",
      confirmed_facts: draft.facts,
      possible_explanations: draft.possibleExplanations,
      unsupported_claims: draft.claims,
      evidence_list: draft.evidence,
      reference_links: draft.referenceLinks,
      open_questions:
        draft.openQuestions ||
        ["- 哪些關鍵節點還需要更多來源支持？", "- 哪些雙方說法仍需要交叉核對？"].join("\n"),
      summary_image_note: draft.imageNote,
    };
  }

  const questionSnippet = content.slice(0, 120);
  const questionTail = content.length > 120 ? "..." : "";

  return {
    question: content,
    narrative_timeline: "",
    narrative_side_a: "",
    narrative_side_b: "",
    stable_conclusion: "這份提案已被升格為正式案件，後續需要再補強整理。",
    confirmed_facts: [
      "- 目前案件內容來自已送出的 proposal。",
      `- 原始提案標題：${title}`,
      `- 升格日期：${today}`,
    ].join("\n"),
    possible_explanations: "",
    unsupported_claims: [
      "- 目前仍有部分說法缺少直接證據支持。",
      "- 後續可再透過 accepted submissions 補入雙方材料。",
    ].join("\n"),
    evidence_list: [
      "- 後續可補入 accepted submissions 與外部來源。",
      "- 建議先補關鍵文件、時間線與對應說法。",
    ].join("\n"),
    reference_links: "",
    open_questions: [
      "- 提案中的哪個核心爭點最需要再查證？",
      "- 雙方觀點是否都有足夠脈絡可以整理？",
      `- 目前提案摘要：${questionSnippet}${questionTail}`,
    ].join("\n"),
    summary_image_note: "",
  };
}
