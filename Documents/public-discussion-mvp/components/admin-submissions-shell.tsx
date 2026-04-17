"use client";

import { AdminSubmissionsBoard } from "@/components/admin-submissions-board";
import type { SubmissionRecord } from "@/lib/types";

export function AdminSubmissionsShell({
  initialSubmissions,
}: {
  initialSubmissions: SubmissionRecord[];
}) {
  return <AdminSubmissionsBoard initialSubmissions={initialSubmissions} />;
}
