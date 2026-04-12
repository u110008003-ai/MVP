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
    <main className="min-h-screen overflow-hidden bg-[#f4efe4] px-6 py-10 text-stone-950">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(232,175,52,0.34),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(28,27,25,0.12),transparent_32%),linear-gradient(180deg,#f4efe4_0%,#fbfaf7_48%,#fff_100%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
            公共討論平台 MVP
          </Link>
          <HomeAuthNav />
        </header>

        <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-300/70 bg-[#171614] p-8 text-stone-50 shadow-[0_28px_90px_-42px_rgba(28,25,23,0.8)]">
          <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute bottom-[-12rem] left-[35%] h-80 w-80 rounded-full bg-stone-100/10 blur-3xl" />

          <div className="relative max-w-4xl">
            <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
              公共討論平台 MVP
            </p>

            <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.04em] text-white md:text-7xl">
              把情緒降到最低，
              <br />
              <span className="text-amber-300">把判斷拉到前面。</span>
            </h1>

            <p className="mt-6 max-w-3xl text-xl leading-9 text-stone-200">
              不是幫你站隊，而是幫你看清楚：哪些是真的，哪些只是話術。
            </p>

            <p className="mt-5 inline-flex max-w-3xl rounded-[1.5rem] border border-white/15 bg-white/[0.06] px-5 py-4 text-base font-semibold leading-8 text-amber-100">
              當別人忙著表態，這裡忙著把事情講清楚。
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#cases"
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                先看案件
              </a>
              <a
                href="#participation"
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-200"
              >
                了解怎麼參與
              </a>
            </div>
          </div>
        </section>

        <section id="cases" className="grid gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
                Case List
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">目前正在整理的案件</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                先看每個案件的摘要，再點進去看完整脈絡、證據、修訂紀錄與參考連結。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/proposals"
                className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
              >
                前往提案池
              </Link>
            </div>
          </div>

          {error || source !== "supabase" ? (
            <div className="rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-600">
              {error ?? "目前顯示的是樣本資料。"}
            </div>
          ) : null}

          <div className="grid gap-4">
            {cases.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600">
                目前還沒有案件。
              </div>
            ) : (
              cases.map((caseItem) => (
                <Link
                  key={caseItem.id}
                  href={`/cases/${caseItem.id}`}
                  className="group rounded-[1.9rem] border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(41,37,36,0.45)] transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-[0_18px_60px_-30px_rgba(180,83,9,0.35)]"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 max-w-3xl">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                        {statusLabel[caseItem.status]}
                      </span>

                      <h3 className="mt-4 text-2xl font-semibold leading-tight text-stone-950 transition group-hover:text-amber-800">
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

                      <div className="mt-5 rounded-[1.35rem] border border-stone-200 bg-stone-50/90 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
                          摘要
                        </p>
                        <p className="mt-3 line-clamp-home-card text-[15px] leading-7 text-stone-700">
                          {buildCardSummary(caseItem.stable_conclusion || caseItem.question)}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-amber-800">查看更多</p>
                      </div>
                    </div>

                    <div className="grid shrink-0 gap-3 lg:w-[220px]">
                      <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                        最後更新
                        <div className="mt-1 font-semibold text-stone-900">
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
          className="grid gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(41,37,36,0.2)] md:grid-cols-3"
        >
          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              你能做什麼
            </p>
            <h2 className="mt-3 text-xl font-semibold text-stone-950">不是先表態，是先補內容</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              看完案件之後，你可以依照自己的層級補證據、提新題目，或參與整理。
            </p>
          </article>

          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              Participation Levels
            </p>
            <div className="mt-4 grid gap-3 text-sm leading-7 text-stone-700">
              <p>
                <span className="font-semibold text-stone-950">Level 1：</span>
                補充證據、指出錯誤、修正推論
              </p>
              <p>
                <span className="font-semibold text-stone-950">Level 2：</span>
                提出新題目
              </p>
              <p>
                <span className="font-semibold text-stone-950">Level 3：</span>
                整理案件、管理內容、升格結論
              </p>
            </div>
          </article>

          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              帳號入口
            </p>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              登入和註冊已經移到頁面右上角。先看內容，再決定要不要加入，首頁正文不再先塞一整塊登入表單。
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}

function AttributionPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-600">
      {label}：<span className="ml-1 text-stone-900">{value}</span>
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
