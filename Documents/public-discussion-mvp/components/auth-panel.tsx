"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import type { UserRole } from "@/lib/types";

const roleLabel: Record<UserRole, string> = {
  level_1: "Level 1",
  level_2: "Level 2",
  level_3: "Level 3",
  level_4: "管理端",
};

type AuthMode = "sign-in" | "sign-up";

function getVisibleRoleLabel(role: UserRole | null | undefined) {
  if (!role) {
    return "角色未同步";
  }

  return roleLabel[role];
}

export function AuthPanel() {
  const { session, profile, supabaseAvailable } = useAuth();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!supabase) {
      setFeedback("Supabase 尚未完成設定，請稍後再試。");
      return;
    }

    startTransition(async () => {
      const normalizedEmail = email.trim();
      const normalizedPassword = password.trim();
      const normalizedName = displayName.trim();

      if (!normalizedEmail || !normalizedPassword) {
        setFeedback("請先填入 email 與密碼。");
        return;
      }

      if (mode === "sign-up") {
        if (normalizedPassword.length < 6) {
          setFeedback("密碼至少需要 6 個字元。");
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: normalizedPassword,
          options: {
            data: {
              display_name: normalizedName || normalizedEmail.split("@")[0],
            },
          },
        });

        if (error) {
          setFeedback(`註冊失敗：${error.message}`);
          return;
        }

        if (data.session) {
          setFeedback("註冊成功，已直接登入。");
        } else {
          setFeedback("註冊成功，請到信箱完成驗證後再登入。");
        }

        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      if (error) {
        setFeedback(`登入失敗：${error.message}`);
        return;
      }

      setFeedback("登入成功。");
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
    <section className="glass-panel grid gap-5 p-6">
      <div className="space-y-2">
        <p className="section-kicker">帳號面板</p>
        <h2 className="font-serif text-2xl text-[var(--color-text)]">參與與登入</h2>
      </div>

      {session?.user ? (
        <div className="grid gap-4">
          <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface-card)] p-5">
            <p className="text-sm text-[var(--color-text-muted)]">目前登入</p>
            <p className="mt-3 font-serif text-3xl text-[var(--color-text)]">
              {profile?.display_name || session.user.email}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{session.user.email}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-[var(--color-text)]">
                {getVisibleRoleLabel(profile?.role)}
              </span>
            </div>
          </div>

          <div className="grid gap-2 text-sm leading-8 text-[var(--color-text-soft)]">
            <p>Level 1：補充證據、指出錯誤、修正推論、提出題目</p>
            <p>Level 2：補強草稿、整理討論方向</p>
            <p>Level 3：整理案件、管理內容、升格結論</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {profile?.role && (profile.role === "level_3" || profile.role === "level_4") ? (
              <Link
                href="/admin/submissions"
                className="glass-chip inline-flex rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-text-soft)] transition hover:text-[var(--color-text)]"
              >
                前往提案池
              </Link>
            ) : null}

            <button
              type="button"
              onClick={handleSignOut}
              disabled={isPending}
              className="glass-chip inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium text-[var(--color-text-soft)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
            >
              登出
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          <div className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("sign-in");
                setFeedback(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "sign-in"
                  ? "bg-[var(--color-text)] text-[var(--color-accent-ink)]"
                  : "text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
              }`}
            >
              登入
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("sign-up");
                setFeedback(null);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "sign-up"
                  ? "bg-[var(--color-text)] text-[var(--color-accent-ink)]"
                  : "text-[var(--color-text-soft)] hover:text-[var(--color-text)]"
              }`}
            >
              註冊
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--color-text-soft)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-main)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </label>

            {mode === "sign-up" ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-text-soft)]">顯示名稱</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="例如：Alice"
                  className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-main)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
                />
              </label>
            ) : null}

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[var(--color-text-soft)]">密碼</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "sign-up" ? "至少 6 個字元" : "請輸入密碼"}
                className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-main)] px-4 py-3 text-base text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)]"
              />
            </label>

            <button
              type="submit"
              disabled={isPending || !supabaseAvailable}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-text)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-text-muted)]"
            >
              {isPending ? "處理中..." : mode === "sign-in" ? "登入" : "建立帳號"}
            </button>
          </form>

          <p className="text-sm leading-8 text-[var(--color-text-muted)]">
            目前使用 Email + 密碼登入。若註冊後需要驗證，請到信箱完成確認。
          </p>
        </div>
      )}

      {feedback || !supabaseAvailable ? (
        <div className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-8 text-[var(--color-text-soft)]">
          {feedback ?? "Supabase 尚未完成設定，請先確認網站環境變數。"}
        </div>
      ) : null}
    </section>
  );
}
