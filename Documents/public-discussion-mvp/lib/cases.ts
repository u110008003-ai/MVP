import { sampleCases } from "@/lib/sample-cases";
import { getSupabaseServerClient, getSupabaseServerClientForToken } from "@/lib/supabase";
import type { CaseRecord, ProposalRecord, RevisionRecord, SubmissionRecord } from "@/lib/types";

const publicCaseColumns = [
  "id",
  "title",
  "question",
  "narrative_timeline",
  "narrative_side_a",
  "narrative_side_b",
  "stable_conclusion",
  "confirmed_facts",
  "possible_explanations",
  "unsupported_claims",
  "evidence_list",
  "reference_links",
  "open_questions",
  "summary_image_url",
  "summary_image_note",
  "status",
  "updated_at",
  "created_by_display_name",
  "promoted_by_display_name",
].join(", ");

const privateCaseColumns = [
  "id",
  "title",
  "question",
  "narrative_timeline",
  "narrative_side_a",
  "narrative_side_b",
  "stable_conclusion",
  "confirmed_facts",
  "possible_explanations",
  "unsupported_claims",
  "evidence_list",
  "reference_links",
  "open_questions",
  "summary_image_url",
  "summary_image_note",
  "status",
  "created_by",
  "promoted_by",
  "updated_at",
].join(", ");

type PublicCaseRow = {
  id: string;
  title: string;
  question: string;
  narrative_timeline: string;
  narrative_side_a?: string | null;
  narrative_side_b?: string | null;
  stable_conclusion: string;
  confirmed_facts: string;
  possible_explanations: string;
  unsupported_claims: string;
  evidence_list: string;
  reference_links: string;
  open_questions: string;
  summary_image_url: string;
  summary_image_note: string;
  status: CaseRecord["status"];
  updated_at: string;
  created_by_display_name: string | null;
  promoted_by_display_name: string | null;
};

type PublicProposalRow = {
  id: string;
  title: string;
  content: string;
  status: ProposalRecord["status"];
  promoted_case_id: string | null;
  created_at: string;
  updated_at: string | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
};

type PublicSubmissionRow = {
  id: string;
  case_id: string;
  type: SubmissionRecord["type"];
  content: string;
  source_url: string | null;
  created_at: string;
};

type PublicRevisionRow = {
  id: string;
  case_id: string;
  summary: string;
  detail: string;
  created_at: string;
};

type PrivateCaseRow = Omit<CaseRecord, "created_by_profile" | "promoted_by_profile">;

type AdminSubmissionRow = SubmissionRecord & {
  cases?: {
    title: string;
  } | Array<{
    title: string;
  }> | null;
};

export async function getCases() {
  const supabase = getSupabaseServerClient();
  const isProduction = process.env.NODE_ENV === "production";

  if (!supabase) {
    return {
      cases: isProduction ? ([] as CaseRecord[]) : sampleCases,
      source: isProduction ? ("supabase" as const) : ("sample" as const),
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("public_cases")
    .select(publicCaseColumns)
    .order("updated_at", { ascending: false });

  if (error) {
    return {
      cases: isProduction ? ([] as CaseRecord[]) : sampleCases,
      source: isProduction ? ("supabase" as const) : ("sample" as const),
      error: `Failed to read public cases: ${error.message}`,
    };
  }

  return {
    cases: (data ?? []).map(mapPublicCaseRow),
    source: "supabase" as const,
    error: null,
  };
}

export async function getCaseById(id: string) {
  const supabase = getSupabaseServerClient();
  const isProduction = process.env.NODE_ENV === "production";

  if (!supabase) {
    const fallback = isProduction ? null : sampleCases.find((item) => item.id === id) ?? null;
    return {
      caseItem: fallback,
      source: isProduction ? ("supabase" as const) : ("sample" as const),
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("public_cases")
    .select(publicCaseColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      caseItem: null,
      source: "supabase" as const,
      error: `Failed to read public case: ${error.message}`,
    };
  }

  return {
    caseItem: data ? mapPublicCaseRow(data as PublicCaseRow) : null,
    source: "supabase" as const,
    error: null,
  };
}

export async function getCaseByIdForEditor(accessToken: string, id: string) {
  const supabase = getSupabaseServerClientForToken(accessToken);

  if (!supabase) {
    return {
      caseItem: null,
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("cases")
    .select(privateCaseColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return {
      caseItem: null,
      error: `Failed to read case editor payload: ${error.message}`,
    };
  }

  return {
    caseItem: data
      ? ({
          ...(data as unknown as PrivateCaseRow),
          narrative_side_a:
            (data as Partial<CaseRecord>).narrative_side_a ??
            (data as Partial<CaseRecord>).narrative_timeline ??
            "",
          narrative_side_b: (data as Partial<CaseRecord>).narrative_side_b ?? "",
        } as CaseRecord)
      : null,
    error: null,
  };
}

export async function getAdminSubmissions(accessToken: string) {
  const supabase = getSupabaseServerClientForToken(accessToken);

  if (!supabase) {
    return {
      submissions: [] as SubmissionRecord[],
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("id, case_id, type, content, source_url, status, created_at, cases(title)")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      submissions: [] as SubmissionRecord[],
      error: `Failed to read submissions: ${error.message}`,
    };
  }

  return {
    submissions: (data ?? []).map((item) => {
      const row = item as AdminSubmissionRow;
      const caseRelation = Array.isArray(row.cases) ? row.cases[0] ?? null : row.cases ?? null;

      return {
        ...row,
        cases: caseRelation,
      } satisfies SubmissionRecord;
    }),
    error: null,
  };
}

export async function getAcceptedSubmissionsForCase(caseId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      submissions: [] as SubmissionRecord[],
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("public_accepted_submissions")
    .select("id, case_id, type, content, source_url, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      submissions: [] as SubmissionRecord[],
      error: `Failed to read accepted submissions: ${error.message}`,
    };
  }

  return {
    submissions: (data ?? []).map((item) => mapPublicSubmissionRow(item as PublicSubmissionRow)),
    error: null,
  };
}

export async function getRevisionsForCase(caseId: string) {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      revisions: [] as RevisionRecord[],
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("public_case_revisions")
    .select("id, case_id, summary, detail, created_at")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      revisions: [] as RevisionRecord[],
      error: `Failed to read case revisions: ${error.message}`,
    };
  }

  return {
    revisions: (data ?? []).map((item) => mapPublicRevisionRow(item as PublicRevisionRow)),
    error: null,
  };
}

export async function getProposals() {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      proposals: [] as ProposalRecord[],
      error: "Server is missing Supabase environment settings.",
    };
  }

  const { data, error } = await supabase
    .from("public_proposals")
    .select(
      "id, title, content, status, promoted_case_id, created_at, updated_at, author_display_name, reviewer_display_name",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return {
      proposals: [] as ProposalRecord[],
      error: `Failed to read public proposals: ${error.message}`,
    };
  }

  return {
    proposals: (data ?? []).map((item) => mapPublicProposalRow(item as PublicProposalRow)),
    error: null,
  };
}

function mapPublicCaseRow(item: PublicCaseRow): CaseRecord {
  return {
    id: item.id,
    title: item.title,
    question: item.question,
    narrative_timeline: item.narrative_timeline,
    narrative_side_a: item.narrative_side_a ?? item.narrative_timeline ?? "",
    narrative_side_b: item.narrative_side_b ?? "",
    stable_conclusion: item.stable_conclusion,
    confirmed_facts: item.confirmed_facts,
    possible_explanations: item.possible_explanations,
    unsupported_claims: item.unsupported_claims,
    evidence_list: item.evidence_list,
    reference_links: item.reference_links,
    open_questions: item.open_questions,
    summary_image_url: item.summary_image_url,
    summary_image_note: item.summary_image_note,
    status: item.status,
    updated_at: item.updated_at,
    created_by_profile: item.created_by_display_name
      ? { display_name: item.created_by_display_name }
      : null,
    promoted_by_profile: item.promoted_by_display_name
      ? { display_name: item.promoted_by_display_name }
      : null,
  };
}

function mapPublicProposalRow(item: PublicProposalRow): ProposalRecord {
  return {
    id: item.id,
    user_id: null,
    title: item.title,
    content: item.content,
    status: item.status,
    promoted_case_id: item.promoted_case_id,
    reviewed_by: null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    profiles: item.author_display_name ? { display_name: item.author_display_name } : null,
    reviewed_by_profile: item.reviewer_display_name
      ? { display_name: item.reviewer_display_name }
      : null,
  };
}

function mapPublicSubmissionRow(item: PublicSubmissionRow): SubmissionRecord {
  return {
    id: item.id,
    case_id: item.case_id,
    type: item.type,
    content: item.content,
    source_url: item.source_url,
    status: "accepted",
    created_at: item.created_at,
  };
}

function mapPublicRevisionRow(item: PublicRevisionRow): RevisionRecord {
  return {
    id: item.id,
    case_id: item.case_id,
    editor_id: null,
    summary: item.summary,
    detail: item.detail,
    created_at: item.created_at,
  };
}
