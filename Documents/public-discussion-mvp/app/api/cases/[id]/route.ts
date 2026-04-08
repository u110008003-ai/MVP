import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server-auth";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { CaseRecord, CaseUpdatePayload } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(request, "level_3");

  if (!auth.actor || auth.response) {
    return auth.response ?? NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as Partial<CaseUpdatePayload>;

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Server is missing Supabase environment settings." },
      { status: 500 },
    );
  }

  const casesReader = supabase.from("cases") as unknown as {
    select: (columns: string) => {
      eq: (
        column: string,
        value: string,
      ) => {
        single: () => PromiseLike<{ data: CaseRecord | null; error: { message: string } | null }>;
      };
    };
  };

  const existingCaseResult = await casesReader
    .select(
      "id, title, question, stable_conclusion, confirmed_facts, unsupported_claims, evidence_list, open_questions, status, updated_at",
    )
    .eq("id", id)
    .single();

  if (existingCaseResult.error || !existingCaseResult.data) {
    return NextResponse.json(
      { error: `Case not found: ${existingCaseResult.error?.message ?? ""}`.trim() },
      { status: 404 },
    );
  }

  const existingCase = existingCaseResult.data;

  const payload: CaseUpdatePayload = {
    stable_conclusion: body.stable_conclusion?.trim() ?? "",
    confirmed_facts: body.confirmed_facts?.trim() ?? "",
    unsupported_claims: body.unsupported_claims?.trim() ?? "",
    evidence_list: body.evidence_list?.trim() ?? "",
    open_questions: body.open_questions?.trim() ?? "",
  };

  const casesTable = supabase.from("cases") as unknown as {
    update: (values: CaseUpdatePayload) => {
      eq: (
        column: string,
        value: string,
      ) => PromiseLike<{ error: { message: string } | null }>;
    };
  };

  const { error } = await casesTable.update(payload).eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: `Failed to update case: ${error.message}` },
      { status: 500 },
    );
  }

  const changedFields = getChangedFields(existingCase, payload);

  if (changedFields.length > 0) {
    const revisionsTable = supabase.from("revisions") as unknown as {
      insert: (values: {
        case_id: string;
        editor_id: string;
        summary: string;
        detail: string;
      }) => PromiseLike<{ error: { message: string } | null }>;
    };

    const revisionSummary = `Updated fields: ${changedFields
      .map((field) => field.label)
      .join(", ")}`;
    const revisionDetail = changedFields
      .map((field) => {
        const before = readableValue(existingCase[field.key]);
        const after = readableValue(payload[field.key]);
        return `${field.label}\nBefore: ${before}\nAfter: ${after}`;
      })
      .join("\n\n");

    const revisionResult = await revisionsTable.insert({
      case_id: id,
      editor_id: auth.actor.id,
      summary: revisionSummary,
      detail: revisionDetail,
    });

    if (revisionResult.error) {
      return NextResponse.json(
        { error: `Case updated but failed to create revision: ${revisionResult.error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    message: "Case updated successfully.",
  });
}

function getChangedFields(existingCase: CaseRecord, payload: CaseUpdatePayload) {
  const fieldLabels: Record<keyof CaseUpdatePayload, string> = {
    stable_conclusion: "Stable conclusion",
    confirmed_facts: "Confirmed facts",
    unsupported_claims: "Unsupported claims",
    evidence_list: "Evidence list",
    open_questions: "Open questions",
  };

  return (Object.keys(fieldLabels) as Array<keyof CaseUpdatePayload>)
    .filter((field) => existingCase[field] !== payload[field])
    .map((field) => ({
      key: field,
      label: fieldLabels[field],
    }));
}

function readableValue(value: string) {
  return value.trim() ? value : "(empty)";
}
