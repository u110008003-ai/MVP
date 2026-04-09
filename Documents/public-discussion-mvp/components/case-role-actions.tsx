"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { roleMeetsRequirement } from "@/lib/roles";

export function CaseRoleActions({ caseId }: { caseId: string }) {
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <span className="rounded-full border border-stone-700 px-3 py-1 text-sm text-stone-500">
        載入中...
      </span>
    );
  }

  if (!profile?.role || !roleMeetsRequirement(profile.role, "level_3")) {
    return null;
  }

  return (
    <>
      <Link
        href={`/cases/${caseId}/edit`}
        className="rounded-full border border-stone-700 px-3 py-1 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-300"
      >
        編輯 Case
      </Link>
      <Link
        href="/admin/submissions"
        className="rounded-full border border-stone-700 px-3 py-1 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-300"
      >
        管理 Submissions
      </Link>
    </>
  );
}
