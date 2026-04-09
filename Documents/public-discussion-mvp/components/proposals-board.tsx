"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  isStructuredProposalContent,
  parseProposalDraft,
  proposalDraftSections,
} from "@/lib/proposal-draft";
import { roleMeetsRequirement } from "@/lib/roles";
import type { ProposalRecord } from "@/lib/types";

export function ProposalsBoard({
  initialProposals,
}: {
  initialProposals: ProposalRecord[];
}) {
  const { loading, session, profile } = useAuth();
  const [proposals, setProposals] = useState(initialProposals);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canPromote =
    Boolean(session?.user) &&
    Boolean(profile?.role && roleMeetsRequirement(profile.role, "level_3"));

  function promoteProposal(proposalId: string) {
    if (!session?.user) {
      setFeedback("請先登入後再操作。");
      return;
    }

    if (!canPromote) {
      setFeedback("只有 Level 3 以上帳號可以把提案升格成案件。");
      return;
    }

    setFeedback(null);

    startTransition(async () => {
      const accessToken = session.access_token;

      if (!accessToken) {
        setFeedback("登入狀態失效，請重新登入後再試一次。");
        return;
      }

      const response = await fetch(`/api/proposals/${proposalId}/promote`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = (await response.json()) as {
        code?: string;
        error?: string;
        message?: string;
        promoted_case_id?: string;
      };

      if (!response.ok) {
        setFeedback(getApiErrorMessage(data, response.status));
        return;
      }

      setProposals((current) =>
        current.map((proposal) =>
          proposal.id === proposalId
            ? {
                ...proposal,
                status: "promoted",
                promoted_case_id: data.promoted_case_id ?? proposal.promoted_case_id ?? null,
              }
            : proposal,
        ),
      );
      setFeedback(data.message ?? "提案已升格為案件。");
    });
  }

  return (
    <section className="grid gap-4">
      {feedback ? (
        <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
          {feedback}
        </div>
      ) : null}

      {proposals.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600">
          目前還沒有任何提案。
        </div>
      ) : (
        proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            canPromote={canPromote}
            isPending={isPending || loading}
            onPromote={promoteProposal}
          />
        ))
      )}
    </section>
  );
}

function ProposalCard({
  proposal,
  canPromote,
  isPending,
  onPromote,
}: {
  proposal: ProposalRecord;
  canPromote: boolean;
  isPending: boolean;
  onPromote: (proposalId: string) => void;
}) {
  const structured = isStructuredProposalContent(proposal.content);
  const draft = parseProposalDraft(proposal.content);

  return (
    <article className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(41,37,36,0.25)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          {proposal.status === "promoted" ? "已升格" : "草稿提案"}
        </span>
        <span className="text-sm text-stone-500">
          提案者：{proposal.profiles?.display_name ?? "未知"}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-semibold text-stone-950">{proposal.title}</h2>

      {structured ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {proposalDraftSections.map((section) => (
            <section
              key={section.key}
              className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">
                {section.label}
              </p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-stone-700">
                {draft[section.key]?.trim() || "尚未填寫"}
              </p>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-base leading-7 text-stone-700">
          {proposal.content}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {proposal.promoted_case_id ? (
          <Link
            href={`/cases/${proposal.promoted_case_id}`}
            className="inline-flex rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950"
          >
            查看已建立案件
          </Link>
        ) : null}

        {canPromote && proposal.status !== "promoted" ? (
          <button
            type="button"
            onClick={() => onPromote(proposal.id)}
            disabled={isPending}
            className="inline-flex rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            升格成案件
          </button>
        ) : null}
      </div>
    </article>
  );
}
