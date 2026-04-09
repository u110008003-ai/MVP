export type CaseStatus = "draft" | "proposal" | "formal";
export type SubmissionType = "evidence" | "error" | "inference";
export type UserRole = "level_1" | "level_2" | "level_3" | "level_4";

export type CaseRecord = {
  id: string;
  title: string;
  question: string;
  stable_conclusion: string;
  confirmed_facts: string;
  unsupported_claims: string;
  evidence_list: string;
  open_questions: string;
  status: CaseStatus;
  updated_at: string;
};

export type CaseUpdatePayload = Pick<
  CaseRecord,
  | "stable_conclusion"
  | "confirmed_facts"
  | "unsupported_claims"
  | "evidence_list"
  | "open_questions"
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
