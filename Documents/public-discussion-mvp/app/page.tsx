import Link from "next/link";
import { HomeAuthNav } from "@/components/home-auth-nav";
import { getCases } from "@/lib/cases";
import { CaseStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusLabel: Record<CaseStatus, string> = {
  draft: "草稿",
  proposal: "提案中",
  formal: "正式",
};

export default async function Home() {
  const { cases, source, error } = await getCases();

  return (
    <main className="min-h-screen overflow-hidden bg-[color:var(--color-background)] px-6 py-10 text-[color:var(--color-foreground)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]"
          >
            公共討論平台 MVP
          </Link>
          <HomeAuthNav />
        </header>

        <section className="glass-panel-strong relative overflow-hidden rounded-[2.6rem] p-8 text-white shadow-[0_38px_120px_-58px_rgba(2,6,23,0.9)] md:p-10">
          <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-sky-300/16 blur-3xl" />
          <div className="absolute bottom-[-12rem] left-[35%] h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <p className="glass-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-100">
              公共討論平台 MVP
            </p>

            <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.04em] text-white md:text-7xl">
              把情緒降到最低，
              <br />
              <span className="text-[color:var(--color-accent-strong)]">把判斷拉到前面。</span>
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-200">
              不是幫你選邊站，而是陪你看清楚：哪些是事實，哪些只是話術。
            </p>

            <p className="glass-chip mt-5 inline-flex max-w-3xl rounded-[1.5rem] px-5 py-4 text-base font-semibold leading-8 text-amber-100">
              當別人忙著表態，這個網站忙著把事情講清楚。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cases"
                className="rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-bold text-[color:var(--color-accent-ink)] shadow-[0_22px_44px_-30px_rgba(210,162,83,0.72)] transition hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-strong)]"
              >
                先看案件
              </a>
              <a
                href="#participation"
                className="glass-chip rounded-full px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-sky-300/30 hover:text-white"
              >
                了解怎麼參與
              </a>
            </div>
          </div>
        </section>

        <section id="cases" className="grid gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-text-muted)]">
                Case List
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">目前正在整理的案件</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                先看每個案件的摘要，再點進去看完整脈絡、證據、修訂紀錄與參考連結。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/proposals"
                className="glass-chip rounded-full px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:text-white"
              >
                前往提案池
              </Link>
            </div>
          </div>

          {error || source !== "supabase" ? (
            <div className="glass-panel rounded-[1.25rem] px-4 py-3 text-sm leading-7 text-slate-300">
              {error ?? "目前顯示的是樣本資料。"}
            </div>
          ) : null}

          <div className="grid gap-4">
            {cases.length === 0 ? (
              <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-slate-300">
                目前還沒有案件。
              </div>
            ) : (
              cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="glass-panel group rounded-[1.9rem] p-6 transition hover:-translate-y-0.5 hover:border-[color:var(--color-line-strong)] hover:shadow-[0_18px_60px_-30px_rgba(2,6,23,0.95)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 max-w-3xl">
                      <span className="metal-chip rounded-full px-3 py-1 text-sm font-medium">
                        {statusLabel[caseItem.status]}
                      </span>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight text-white transition group-hover:text-[color:var(--color-accent-strong)]">
                        {caseItem.title}
                      </h3>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <AttributionPill
                          label="提案者"
                          value={caseItem.created_by_profile?.display_name || "尚未紀錄"}
                        />
                        <AttributionPill
                          label="升格者"
                          value={caseItem.promoted_by_profile?.display_name || "尚未紀錄"}
                        />
                      </div>

                      <div className="glass-chip mt-5 rounded-[1.35rem] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--color-text-muted)]">
                          摘要
                        </p>
                        <p className="mt-3 line-clamp-home-card text-[15px] leading-7 text-slate-200">
                          {buildCardSummary(caseItem.stable_conclusion || caseItem.question)}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[color:var(--color-accent-strong)]">
                          查看更多
                        </p>
                      </div>
                    </div>

                    <div className="grid shrink-0 gap-3 lg:w-[220px]">
                      <div className="glass-chip rounded-[1.25rem] px-4 py-3 text-sm text-slate-300">
                        最後更新
                        <div className="mt-1 font-semibold text-white">
                          {formatRelativeTime(caseItem.updated_at)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section
          id="participation"
          className="glass-panel grid gap-4 rounded-[2rem] p-6 shadow-[0_18px_60px_-35px_rgba(2,6,23,0.7)] lg:grid-cols-[1.05fr_1.4fr]"
        >
          <article className="glass-chip flex flex-col justify-center rounded-[1.25rem] p-6 text-center lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              你能做什麼
            </p>
            <h2 className="mt-3 text-xl font-semibold text-white">不是先表態，是先補內容</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              看完案件之後，你可以依照自己的層級補證據、提新題目，或參與整理。
            </p>
          </article>

          <article className="glass-chip rounded-[1.25rem] p-4 text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
              Participation Levels
            </p>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-200 sm:grid-cols-3">
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-white">Level 1</p>
                <p className="mt-2">補充證據、指出錯誤、修正推論</p>
              </div>
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-white">Level 2</p>
                <p className="mt-2">提出新題目</p>
              </div>
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-white">Level 3</p>
                <p className="mt-2">整理案件、管理內容、升格結論</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function AttributionPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="glass-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold text-slate-300">
      {label}：<span className="ml-1 text-white">{value}</span>
    </span>
  );
}

function buildCardSummary(value: string) {
  const normalized = value
    .replace(/^- /gm, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "這個案件已建立，但首頁摘要還沒有整理完成。";
  }

  return normalized;
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未知";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

  if (diffMinutes < 1) {
    return "剛剛更新";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分鐘前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} 小時前`;
  }

  const diffDays = Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "昨天更新";
  }

  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
