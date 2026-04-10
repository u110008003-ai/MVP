import Link from "next/link";
import { AuthPanel } from "@/components/auth-panel";
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
        <section className="relative overflow-hidden rounded-[2.5rem] border border-stone-300/70 bg-[#171614] p-8 text-stone-50 shadow-[0_28px_90px_-42px_rgba(28,25,23,0.8)]">
          <div className="absolute right-[-8rem] top-[-10rem] h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute bottom-[-12rem] left-[35%] h-80 w-80 rounded-full bg-stone-100/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-[1.18fr_0.82fr]">
            <div>
              <p className="inline-flex rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
                公共討論平台 MVP
              </p>

              <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[1.08] tracking-[-0.04em] text-white md:text-7xl">
                有些人只會表態。
                <br />
                <span className="text-amber-300">有些人會先查證。</span>
              </h1>

              <p className="mt-6 max-w-2xl text-xl leading-9 text-stone-200">
                這裡不是給想吵贏的人，是給想看懂的人。
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/proposals"
                  className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-stone-950 transition hover:-translate-y-0.5 hover:bg-amber-200"
                >
                  提出新題目
                </Link>
                <a
                  href="#cases"
                  className="rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-200"
                >
                  查看案件
                </a>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                    資料狀態
                  </p>
                  <p className="mt-3 text-2xl font-bold text-white">內容同步正常</p>
                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    案件、補充資料與修訂紀錄可持續更新。
                    {source === "supabase" ? "" : " 目前顯示樣本資料。"}
                  </p>
                  {error ? (
                    <p className="mt-3 text-sm leading-7 text-amber-200">{error}</p>
                  ) : null}
                </div>

                <div className="rounded-[1.75rem] border border-amber-300/30 bg-amber-300/10 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-200">
                    你能做什麼
                  </p>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-stone-200">
                    <p>
                      <span className="font-bold text-white">Level 1：</span>
                      補充證據、指出錯誤、修正推論
                    </p>
                    <p>
                      <span className="font-bold text-white">Level 2：</span>
                      提出新題目
                    </p>
                    <p>
                      <span className="font-bold text-white">Level 3：</span>
                      整理案件、管理內容、升格結論
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid content-start gap-4">
              <AuthPanel />
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 text-stone-100 backdrop-blur">
                <p className="text-lg font-semibold leading-8">
                  不是每個人都要會法律，
                  <br />
                  但每個人都該有能力分辨：
                  <br />
                  <span className="text-amber-300">哪些是事實，哪些只是立場。</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="cases" className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
              Case List
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">目前正在整理的案件</h2>
          </div>

          <Link
            href="/proposals"
            className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
          >
            前往提案池
          </Link>
        </section>

        <section className="grid gap-4">
          {cases.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600">
              目前還沒有案件。
            </div>
          ) : (
            cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/cases/${caseItem.id}`}
                className="group rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(41,37,36,0.45)] transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-[0_18px_60px_-30px_rgba(180,83,9,0.35)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                      {statusLabel[caseItem.status]}
                    </span>

                    <h3 className="mt-4 text-2xl font-semibold text-stone-950 transition group-hover:text-amber-800">
                      {caseItem.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                      穩定結論
                    </p>
                    <p className="mt-2 text-base leading-7 text-stone-700">
                      {caseItem.stable_conclusion || "尚未整理穩定結論。"}
                    </p>
                  </div>

                  <div className="shrink-0 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
                    最後更新
                    <div className="mt-1 font-semibold text-stone-900">
                      {formatDate(caseItem.updated_at)}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "未知";
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
