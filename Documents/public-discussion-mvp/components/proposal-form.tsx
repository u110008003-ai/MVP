"use client";

import { useState, useTransition } from "react";
import { useAuth } from "@/components/auth-provider";
import { getApiErrorMessage } from "@/lib/api-error";
import { roleMeetsRequirement } from "@/lib/roles";

export function ProposalForm() {
  const { loading, session, profile } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const canPropose =
    Boolean(session?.user) &&
    Boolean(profile?.role && roleMeetsRequirement(profile.role, "level_2"));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!canPropose || !session?.user) {
      setFeedback("只有 Level 2 / Level 3 可以送出 proposal。");
      return;
    }

    startTransition(async () => {
      const accessToken = session.access_token;

      if (!accessToken) {
        setFeedback("登入已過期，請重新登入。");
        return;
      }

      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = (await response.json()) as { code?: string; error?: string; message?: string };

      if (!response.ok) {
        setFeedback(getApiErrorMessage(data, response.status));
        return;
      }

      setTitle("");
      setContent("");
      setFeedback(data.message ?? "Proposal 已送出。");
    });
  }

  return (
    <section className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(41,37,36,0.35)]">
      <h2 className="text-2xl font-semibold text-stone-950">新增 Proposal</h2>

      <div className="mt-4 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
        {loading
          ? "正在確認登入狀態..."
          : canPropose
            ? `目前登入：${profile?.display_name ?? session?.user.email}`
            : "請使用 Level 2 / Level 3 帳號登入後送出。"}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">標題</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="請輸入 proposal 標題"
            className="rounded-[1rem] border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-stone-700">內容</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="請描述你要推進成正式 case 的內容（至少 20 字）"
            className="min-h-40 rounded-[1rem] border border-stone-300 px-4 py-3 text-base leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || !canPropose}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isPending ? "送出中..." : "送出 Proposal"}
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
