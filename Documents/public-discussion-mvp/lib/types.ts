export type CaseStatus = "draft" | "proposal" | "formal";
export type SubmissionType = "evidence" | "error" | "inference";
export type UserRole = "level_1" | "level_2" | "level_3" | "level_4";

export type CaseRecord = {
  id: string;
  title: string;
  question: string;
  narrative_timeline: string;
  stable_conclusion: string;
  confirmed_facts: string;
  possible_explanations: string;
  unsupported_claims: string;
  evidence_list: string;
  open_questions: string;
  summary_image_url: string;
  summary_image_note: string;
  status: CaseStatus;
  updated_at: string;
};

export type CaseUpdatePayload = Pick<
  CaseRecord,
  | "question"
  | "stable_conclusion"
  | "confirmed_facts"
  | "possible_explanations"
  | "unsupported_claims"
  | "evidence_list"
  | "open_questions"
  | "narrative_timeline"
  | "summary_image_url"
  | "summary_image_note"
>;

export type SubmissionPayload = {
  case_id: string;
  user_id?: string | null;
  user_display_name?: string | null;
  type: SubmissionType;
  content: string;
  source_url: string | null;
};

export type SubmissionStatus = "pending" | "accepted" | "rejected";

export type SubmissionRecord = {
  id: string;
  case_id: string;
  type: SubmissionType;
  content: string;
  source_url: string | null;
  status: SubmissionStatus;
  created_at: string;
  cases?: {
    title: string;
  } | null;
};

export type RevisionRecord = {
  id: string;
  case_id: string;
  editor_id: string | null;
  summary: string;
  detail: string;
  created_at: string;
};

export type ProfileRecord = {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  created_at: string;
};

export type ProposalStatus = "under_review" | "promoted";

export type ProposalRecord = {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  status: ProposalStatus;
  promoted_case_id?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  profiles?: {
    display_name: string;
  } | null;
};
