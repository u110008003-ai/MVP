import { sampleCases } from "@/lib/sample-cases";
import { getSupabaseServerClient } from "@/lib/supabase";
import { CaseRecord, ProposalRecord, RevisionRecord, SubmissionRecord } from "@/lib/types";

const caseColumns = [
  "id",
  "title",
  "question",
  "narrative_timeline",
  "stable_conclusion",
  "confirmed_facts",
  "possible_explanations",
  "unsupported_claims",
  "evidence_list",
  "open_questions",
  "summary_image_url",
  "summary_image_note",
  "status",
  "updated_at",
].join(", ");

export async function getCases() {
  const supabase = getSupabaseServerClient();
  const isProduction = process.env.NODE_ENV === "production";

  if (!supabase) {
    return {
      cases: isProduction ? ([] as CaseRecord[]) : sampleCases,
      source: isProduction ? ("supabase" as const) : ("sample" as const),
      error: "Supabase 尚未設定完成。",
    };
  }

  const { data, error } = await supabase
    .from("cases")
    .select(caseColumns)
    .order("updated_at", { ascending: false });

  if (error) {
    return {
      cases: isProduction ? ([] as CaseRecord[]) : sampleCases,
      source: isProduction ? ("supabase" as const) : ("sample" as const),
      error: `讀取 cases 失敗：${error.message}`,
    };
  }

  return {
    cases: (data ?? []) as CaseRecord[],
    source: "supabase" as const,
    error: null,
  };
}

export async function getCaseById(id: string) {
  const { cases, source, error } = await getCases();

  return {
    caseItem: cases.find((item) => item.id === id) ?? null,
    source,
    error,
  };
}

export async function getSubmissions() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      submissions: [] as SubmissionRecord[],
      error: "Supabase 尚未設定完成，無法讀取 submissions。",
    };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id, case_id, type, content, source_url, status, created_at, cases(title)")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      submissions: [] as SubmissionRecord[],
      error: `讀取 submissions 失敗：${error.message}`,
    };
  }

  return {
    submissions: (data ?? []) as SubmissionRecord[],
    error: null,
  };
}

export async function getAcceptedSubmissionsForCase(caseId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      submissions: [] as SubmissionRecord[],
      error: "Supabase 尚未設定完成，無法讀取已採納 submissions。",
    };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id, case_id, type, content, source_url, status, created_at")
    .eq("case_id", caseId)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      submissions: [] as SubmissionRecord[],
      error: `讀取 accepted submissions 失敗：${error.message}`,
    };
  }

  return {
    submissions: (data ?? []) as SubmissionRecord[],
    error: null,
  };
}

export async function getRevisionsForCase(caseId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      revisions: [] as RevisionRecord[],
      error: "Supabase 尚未設定完成，無法讀取 revisions。",
    };
  }

  const { data, error } = await supabase
    .from("revisions")
    .select("id, case_id, editor_id, summary, detail, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      revisions: [] as RevisionRecord[],
      error: `讀取 revisions 失敗：${error.message}`,
    };
  }

  return {
    revisions: (data ?? []) as RevisionRecord[],
    error: null,
  };
}

export async function getProposals() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      proposals: [] as ProposalRecord[],
      error: "Supabase 尚未設定完成，無法讀取 proposals。",
    };
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(
      "id, user_id, title, content, status, promoted_case_id, reviewed_by, created_at, profiles:profiles!proposals_user_id_fkey(display_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      proposals: [] as ProposalRecord[],
      error: `讀取 proposals 失敗：${error.message}`,
    };
  }

  return {
    proposals: (data ?? []) as ProposalRecord[],
    error: null,
  };
}
