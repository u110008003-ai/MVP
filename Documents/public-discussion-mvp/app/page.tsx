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
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f1e8_0%,#fbfaf7_24%,#ffffff_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="rounded-[2rem] border border-stone-300/70 bg-white/90 p-8 shadow-[0_20px_80px_-40px_rgba(41,37,36,0.45)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">
            Public Discussion MVP
          </p>

          <div className="mt-4 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-stone-950">
                以結構化方式整理公共議題，讓討論可追蹤、可修正、可升格。
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-700">
                先建立 case，再收集 submissions，最後把成熟內容整理成正式結論。
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] bg-stone-950 p-6 text-stone-50">
                  <p className="text-sm text-stone-300">資料來源</p>
                  <p className="mt-2 text-2xl font-semibold">
                    {source === "supabase" ? "Supabase" : "本地範例"}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-stone-300">
                    {error ?? "讀取成功。"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
                    Role Design
                  </p>
                  <div className="mt-4 grid gap-2 text-sm leading-7 text-stone-700">
                    <p>Level 1：可提交 evidence / error / inference。</p>
                    <p>Level 2：可新增 proposal。</p>
                    <p>Level 3：可審核 submissions、編輯 case、升格 proposal。</p>
                  </div>
                </div>
              </div>
            </div>

            <AuthPanel />
          </div>
        </section>

        <section className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
              Case List
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              案例清單
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/proposals"
              className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
            >
              前往 Proposals
            </Link>
          </div>
        </section>

        <section className="grid gap-4">
          {cases.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-stone-300 bg-white p-8 text-stone-600">
              目前沒有案例。
            </div>
          ) : (
            cases.map((caseItem) => (
              <Link
                key={caseItem.id}
                href={`/cases/${caseItem.id}`}
                className="group rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-[0_12px_40px_-28px_rgba(41,37,36,0.45)] transition hover:-translate-y-0.5 hover:border-amber-500 hover:shadow-[0_18px_60px_-30px_rgba(180,83,9,0.35)]"
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
                      {caseItem.stable_conclusion}
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
