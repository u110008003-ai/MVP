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
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(41,37,36,0.35)]">
      <h2 className="text-2xl font-semibold text-stone-950">建立草稿提案</h2>

      <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
        {loading
          ? "正在確認登入狀態..."
          : canPropose
            ? `你目前可以提案，登入身份：${profile?.display_name ?? session?.user.email}`
            : "請先登入 Level 2 以上帳號，才可以送出提案。"}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">提案標題</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：某事件是否值得整理成正式案件"
            className="rounded-[1rem] border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
          />
        </label>

        <section className="grid gap-4 rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-950">提案草稿板塊</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              proposal 現在會像 case 一樣分區整理，但它還只是草稿。你可以先把知道的內容填進來，
              之後升格成 case 時會更好整理。
            </p>
          </div>

          {proposalDraftSections.map((section) => (
            <label key={section.key} className="grid gap-2">
              <span className="text-sm font-medium text-stone-700">{section.label}</span>
              <textarea
                value={draft[section.key]}
                onChange={(event) => updateDraftField(section.key, event.target.value)}
                placeholder={`請填寫「${section.label}」`}
                className="min-h-28 rounded-[1rem] border border-stone-300 bg-white px-4 py-3 text-base leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
              />
            </label>
          ))}
        </section>

        <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4 text-sm leading-7 text-stone-600">
          提案送出後，Level 2 可以持續補充內容，Level 3 可以檢查內容是否已足夠，再決定是否升格成正式案件。
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !canPropose}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isPending ? "送出中..." : "送出提案"}
          </button>
        </div>

        {feedback ? (
          <div className="rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
            {feedback}
          </div>
        ) : null}
      </form>
    </section>
  );
}
