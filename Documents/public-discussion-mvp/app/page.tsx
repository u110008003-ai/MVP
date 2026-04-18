import Link from "next/link";
import { HomeAuthNav } from "@/components/home-auth-nav";
import { getCases } from "@/lib/cases";
import { CaseStatus } from "@/lib/types";

// Public-discussion homepage.
export const dynamic = "force-dynamic";

const statusLabel: Record<CaseStatus, string> = {
  draft: "草稿",
  proposal: "提案中",
  formal: "正式",
};

export default async function Home() {
  const { cases, source, error } = await getCases();

  return (
    <main className="page-shell min-h-screen overflow-hidden px-6 py-10 text-[color:var(--color-foreground)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="section-kicker"
          >
            公共討論平台 MVP
          </Link>
          <HomeAuthNav />
        </header>

        <section className="glass-panel-strong relative rounded-[2.2rem] p-8 md:p-12">
          <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-4xl">
              <p className="glass-chip inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[color:var(--color-text-muted)]">
                公共討論平台 MVP
              </p>

              <h1 className="mt-8 max-w-4xl text-5xl leading-[1.12] tracking-[-0.05em] text-[var(--color-text)] md:text-7xl">
                把情緒降到最低，
                <br />
                <span className="text-[color:var(--color-accent-strong)]">把判斷拉到前面。</span>
              </h1>

              <p className="reading-copy mt-6 max-w-3xl text-lg md:text-xl">
                不是幫你選邊站，而是陪你看清楚：哪些是事實，哪些只是話術。
              </p>

              <p className="mt-6 max-w-3xl border-l border-[color:var(--color-line-strong)] pl-5 text-base font-medium leading-8 text-[color:var(--color-gold-strong)]">
                當別人忙著表態，這個網站忙著把事情講清楚。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#cases"
                  className="rounded-full bg-[color:var(--color-accent)] px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-ink)] transition hover:bg-[color:var(--color-accent-strong)]"
                >
                  先看案件
                </a>
                <a
                  href="#participation"
                  className="rounded-full border border-[color:var(--color-border-bright)] bg-[color:var(--color-surface-main)] px-5 py-3 text-sm font-semibold text-[color:var(--color-text-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
                >
                  了解怎麼參與
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <HeroSignalCard
                title="先拆事實"
                description="先把可追溯來源、已確認內容與仍待查證的部分分開。"
              />
              <HeroSignalCard
                title="再看推論"
                description="不同解釋可以並列，但不能假裝它們已經等於結論。"
              />
              <div className="glass-chip rounded-[1.6rem] p-5">
                <p className="section-kicker">Platform Signal</p>
                <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">公開案件會持續補證據、修訂與更新。</p>
                <p className="muted-copy mt-2 text-sm">
                  不是用更大的聲量贏，而是用更清楚的整理讓人判斷。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cases" className="grid gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Case List</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">目前正在整理的案件</h2>
              <p className="muted-copy mt-3 max-w-2xl text-sm">
                先看每個案件的摘要，再點進去看完整脈絡、證據、修訂紀錄與參考連結。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/proposals"
                className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-main)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]"
              >
                前往提案池
              </Link>
            </div>
          </div>

          {error || source !== "supabase" ? (
            <div className="glass-panel rounded-[1.25rem] px-4 py-3 text-sm leading-7 text-[color:var(--color-text-soft)]">
              {error ?? "目前顯示的是樣本資料。"}
            </div>
          ) : null}

          <div className="grid gap-4">
            {cases.length === 0 ? (
              <div className="glass-panel rounded-[1.5rem] border-dashed p-8 text-[color:var(--color-text-muted)]">
                目前還沒有案件。
              </div>
            ) : (
              cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="glass-panel group rounded-[1.9rem] p-6 transition hover:border-[color:var(--color-line-strong)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 max-w-3xl">
                      <span className="metal-chip rounded-full px-3 py-1 text-sm font-medium">
                        {statusLabel[caseItem.status]}
                      </span>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight text-[var(--color-text)] transition group-hover:text-[color:var(--color-gold-strong)]">
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
                        <p className="section-kicker">
                          摘要
                        </p>
                        <p className="line-clamp-home-card mt-3 text-[15px] leading-8 text-[color:var(--color-text-soft)]">
                          {buildCardSummary(caseItem.stable_conclusion || caseItem.question)}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-[color:var(--color-gold-strong)]">
                          查看更多
                        </p>
                      </div>
                    </div>

                    <div className="grid shrink-0 gap-3 lg:w-[220px]">
                      <div className="glass-chip rounded-[1.25rem] px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
                        最後更新
                        <div className="mt-1 font-semibold text-[var(--color-text)]">
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
          className="glass-panel-strong grid gap-4 rounded-[2rem] p-6 lg:grid-cols-[1.05fr_1.4fr]"
        >
          <article className="glass-chip flex flex-col justify-center rounded-[1.25rem] p-6 text-center lg:px-10">
            <p className="section-kicker">你能做什麼</p>
            <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)]">不是先表態，是先補內容</h2>
            <p className="muted-copy mt-3 text-sm">
              看完案件之後，你可以依照自己的層級補證據、提新題目，或參與整理。
            </p>
          </article>

          <article className="glass-chip rounded-[1.25rem] p-4 text-center lg:text-left">
            <p className="section-kicker">Participation Levels</p>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-[color:var(--color-text-soft)] sm:grid-cols-3">
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-[var(--color-text)]">Level 1</p>
                <p className="mt-2 text-[color:var(--color-text-soft)]">補充證據、指出錯誤、修正推論</p>
              </div>
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-[var(--color-text)]">Level 2</p>
                <p className="mt-2 text-[color:var(--color-text-soft)]">提出新題目</p>
              </div>
              <div className="glass-panel rounded-[1rem] p-4">
                <p className="font-semibold text-[var(--color-text)]">Level 3</p>
                <p className="mt-2 text-[color:var(--color-text-soft)]">整理案件、管理內容、升格結論</p>
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
    <span className="glass-chip inline-flex rounded-full px-3 py-1 text-xs font-semibold text-[color:var(--color-text-muted)]">
      {label}：<span className="ml-1 text-[var(--color-text)]">{value}</span>
    </span>
  );
}

function HeroSignalCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="glass-chip rounded-[1.6rem] p-5">
      <p className="section-kicker">Reading Method</p>
      <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">{title}</p>
      <p className="muted-copy mt-2 text-sm">{description}</p>
    </div>
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
