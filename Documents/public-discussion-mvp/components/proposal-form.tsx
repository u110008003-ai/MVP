"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  emptyProposalDraft,
  proposalDraftSections,
  serializeProposalDraft,
  type ProposalDraft,
  type ProposalDraftSectionKey,
} from "@/lib/proposal-draft";
import { roleMeetsRequirement } from "@/lib/roles";

export function ProposalForm() {
  const { loading, session, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [draft, setDraft] = useState<ProposalDraft>(emptyProposalDraft);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canPropose =
    Boolean(session?.user) &&
    Boolean(profile?.role && roleMeetsRequirement(profile.role, "level_2"));

  function updateDraftField(key: ProposalDraftSectionKey, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setTitle("");
    setDraft(emptyProposalDraft);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!canPropose || !session?.user) {
      setFeedback("只有 Level 2 以上帳號可以送出提案。");
      return;
    }

    startTransition(async () => {
      const accessToken = session.access_token;

      if (!accessToken) {
        setFeedback("登入狀態失效，請重新登入後再試一次。");
        return;
      }

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          title,
          content: serializeProposalDraft(draft),
        }),
      });

      const data = (await response.json()) as { code?: string; error?: string; message?: string };

      if (!response.ok) {
        setFeedback(getApiErrorMessage(data, response.status));
        return;
      }

      resetForm();
      setFeedback(data.message ?? "提案已送出。");
    });
  }

  return (
    <section className="glass-panel-strong rounded-[2rem] p-6">
      <h2 className="text-2xl font-semibold text-white">建立草稿提案</h2>

      <div className="glass-chip mt-4 rounded-[1.25rem] px-4 py-3 text-sm leading-7 text-[var(--color-text-soft)]">
        {loading
          ? "正在確認登入狀態..."
          : canPropose
            ? `你目前可以提案，登入身份：${profile?.display_name ?? session?.user.email}`
            : "請先登入 Level 2 以上帳號，才可以送出提案。"}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-text-soft)]">提案標題</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：某事件是否值得整理成正式案件"
            className="rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-card-strong)] px-4 py-3 text-base text-white outline-none transition placeholder:text-[color:var(--color-text-dim)] focus:border-[color:var(--color-accent)]"
          />
        </label>

        <section className="glass-chip grid gap-4 rounded-[1.5rem] p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">提案草稿板塊</h3>
            <p className="muted-copy mt-2 text-sm">
              proposal 現在會盡量和正式 case 使用相同板塊，這樣之後升格時不需要再整份重拆。
              只有「作者 OS / 心裡話」會留在草稿端，不會直接進正式案件。
            </p>
          </div>

          {proposalDraftSections.map((section) => (
            <label key={section.key} className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-text-soft)]">{section.label}</span>
                {!section.promoteToCase ? (
                  <span className="glass-chip rounded-full px-2 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                    草稿限定
                  </span>
                ) : null}
              </div>
              <span className="text-xs leading-6 text-[var(--color-text-muted)]">{section.description}</span>
              <textarea
                value={draft[section.key]}
                onChange={(event) => updateDraftField(section.key, event.target.value)}
                placeholder={`請填寫「${section.label}」`}
                className="min-h-28 rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-card-strong)] px-4 py-3 text-sm leading-7 text-[var(--color-text-soft)] outline-none transition placeholder:text-[color:var(--color-text-dim)] focus:border-[color:var(--color-accent)]"
              />
            </label>
          ))}
        </section>

        <div className="glass-chip rounded-[1.25rem] p-4 text-sm leading-7 text-[var(--color-text-soft)]">
          提案送出後，作者可以持續補內容；Level 3 可以審查是否適合升格；
          正式案件則由管理端做最終整理與管理。
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !canPropose}
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-ink)] transition hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-[color:var(--color-surface-muted)] disabled:text-[color:var(--color-text-dim)]"
          >
            {isPending ? "送出中..." : "送出提案"}
          </button>
        </div>

        {feedback ? (
          <div className="glass-chip rounded-[1rem] px-4 py-3 text-sm leading-7 text-[var(--color-text-soft)]">
            {feedback}
          </div>
        ) : null}
      </form>
    </section>
  );
}
