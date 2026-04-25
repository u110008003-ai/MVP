"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
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

export function HomeAuthNav() {
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

        setFeedback(data.session ? "註冊成功，已直接登入。" : "註冊成功，請到信箱完成驗證。");
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
    <details className="group relative">
      <summary className="glass-chip flex cursor-pointer list-none items-center gap-3 rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]">
        <span>{session?.user ? profile?.display_name || session.user.email : "登入 / 註冊"}</span>
        <span className="text-xs text-[var(--color-text-muted)] transition group-open:rotate-180">⌄</span>
      </summary>

      <div className="glass-panel-strong absolute right-0 z-20 mt-3 w-[min(92vw,24rem)] rounded-[1.5rem] p-5">
        {session?.user ? (
          <div className="grid gap-4">
            <div className="glass-chip rounded-[1.25rem] p-4 text-[var(--color-text)]">
              <p className="text-sm text-[var(--color-text-muted)]">目前登入</p>
              <p className="mt-2 text-lg font-semibold">{profile?.display_name || session.user.email}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{session.user.email}</p>
              <span className="mt-4 inline-flex rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                {getVisibleRoleLabel(profile?.role)}
              </span>
            </div>

            <div className="grid gap-2 text-sm leading-7 text-[var(--color-text-soft)]">
              <p>Level 1：補充證據、指出錯誤、修正推論、提出題目</p>
              <p>Level 2：補強草稿、整理討論方向</p>
              <p>Level 3：整理案件、管理內容、升格結論</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/proposals"
                className="glass-chip inline-flex rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
              >
                前往提案池
              </Link>
              {profile?.role && (profile.role === "level_3" || profile.role === "level_4") ? (
                <Link
                  href="/admin/submissions"
                  className="glass-chip inline-flex rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
                >
                  submissions 管理
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isPending}
                className="glass-chip inline-flex rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:text-[var(--color-text-dim)]"
              >
                登出
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div>
              <p className="section-kicker">Account</p>
              <h2 className="mt-2 text-xl font-semibold text-[var(--color-text)]">登入或建立帳號</h2>
            </div>

            <div className="glass-chip inline-flex w-fit rounded-full p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("sign-in");
                  setFeedback(null);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  mode === "sign-in"
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
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
                    ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                註冊
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--color-text-soft)]">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-main)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[color:var(--color-text-dim)] focus:border-[color:var(--color-gold)]"
                />
              </label>

              {mode === "sign-up" ? (
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--color-text-soft)]">顯示名稱</span>
                  <input
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                    placeholder="例如：Alice"
                    className="rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-main)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[color:var(--color-text-dim)] focus:border-[color:var(--color-gold)]"
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
                  className="rounded-[1rem] border border-[color:var(--color-border)] bg-[color:var(--color-surface-main)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[color:var(--color-text-dim)] focus:border-[color:var(--color-gold)]"
                />
              </label>

              <button
                type="submit"
                disabled={isPending || !supabaseAvailable}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-ink)] transition hover:bg-[color:var(--color-accent-strong)] disabled:cursor-not-allowed disabled:bg-[color:var(--color-surface-muted)] disabled:text-[color:var(--color-text-dim)]"
              >
                {isPending ? "處理中..." : mode === "sign-in" ? "登入" : "建立帳號"}
              </button>
            </form>

            <p className="text-sm leading-7 text-[var(--color-text-muted)]">
              現在只要登入 Level 1 以上帳號，就可以先送出提案。
            </p>
          </div>
        )}

        {feedback || !supabaseAvailable ? (
          <div className="glass-chip mt-4 rounded-[1rem] px-4 py-3 text-sm leading-7 text-[var(--color-text-soft)]">
            {feedback ?? "Supabase 尚未完成設定，請先確認網站環境變數。"}
          </div>
        ) : null}
      </div>
    </details>
  );
}
