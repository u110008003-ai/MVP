"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { useAuth } from "@/components/auth-provider";
import type { UserRole } from "@/lib/types";

const roleLabel: Record<UserRole, string> = {
  level_1: "Level 1",
  level_2: "Level 2",
  level_3: "Level 3",
};

export function AuthPanel() {
  const { session, profile, supabaseAvailable } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!supabase) {
      setFeedback("Supabase 未設定，無法登入。");
      return;
    }

    startTransition(async () => {
      const normalizedEmail = email.trim();
      const normalizedName = displayName.trim();

      if (!normalizedEmail) {
        setFeedback("請輸入 email。");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            display_name: normalizedName || normalizedEmail.split("@")[0],
          },
        },
      });

      if (error) {
        setFeedback(`登入失敗：${error.message}`);
        return;
      }

      setFeedback("登入連結已寄出，請到信箱點 magic link。");
    });
  }

  function handleSignOut() {
    if (!supabase) {
      return;
    }

    startTransition(async () => {
      await supabase.auth.signOut();
      setFeedback("已登出。");
    });
  }

  return (
    <section className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_12px_40px_-30px_rgba(41,37,36,0.35)]">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
        Identity
      </p>

      {session?.user ? (
        <div className="mt-4 grid gap-3">
          <div className="rounded-[1.25rem] bg-stone-950 p-4 text-stone-50">
            <p className="text-sm text-stone-300">目前登入</p>
            <p className="mt-2 text-lg font-semibold">
              {profile?.display_name || session.user.email}
            </p>
            <p className="mt-1 text-sm text-stone-300">{session.user.email}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-stone-950">
                {roleLabel[profile?.role ?? "level_1"]}
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-sm leading-7 text-stone-600">
            <p>Level 1：可提交 evidence / error / inference。</p>
            <p>Level 2：可送出 proposal。</p>
            <p>Level 3：可審核 submissions、編輯 case、升格 proposal。</p>
          </div>

          {profile?.role === "level_3" ? (
            <Link
              href="/admin/submissions"
              className="inline-flex w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50"
            >
              前往 submissions 管理
            </Link>
          ) : null}

          <button
            type="button"
            onClick={handleSignOut}
            disabled={isPending}
            className="inline-flex w-fit items-center justify-center rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:text-stone-400"
          >
            登出
          </button>
        </div>
      ) : (
        <form onSubmit={handleSignIn} className="mt-4 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-[1rem] border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-stone-700">顯示名稱（可選）</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="例如 Alice"
              className="rounded-[1rem] border border-stone-300 px-4 py-3 text-base text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950"
            />
          </label>

          <button
            type="submit"
            disabled={isPending || !supabaseAvailable}
            className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isPending ? "寄送中..." : "寄送登入連結"}
          </button>
        </form>
      )}

      {feedback || !supabaseAvailable ? (
        <div className="mt-4 rounded-[1rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
          {feedback ?? "Supabase 未設定，請先填好環境變數。"}
        </div>
      ) : null}
    </section>
  );
}
