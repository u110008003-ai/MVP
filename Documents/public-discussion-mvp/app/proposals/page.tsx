import Link from "next/link";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalsBoard } from "@/components/proposals-board";
import { getProposals } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const { proposals, error } = await getProposals();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f1e8_0%,#fbfaf7_24%,#ffffff_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              提案區
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">提交新議題</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              當一個議題已經有明確的公共討論價值，但目前首頁還沒有對應案件時，可以先在這裡提出 proposal，
              交由更高權限角色審查後升格為正式 case。
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
          >
            回首頁
          </Link>
        </div>

        <section className="grid gap-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(41,37,36,0.35)] md:grid-cols-3">
          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-base font-semibold text-stone-950">什麼議題值得提案</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              議題具有公共影響、已有一些可整理的資訊線索，且值得被持續追蹤與修正。
            </p>
          </article>

          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-base font-semibold text-stone-950">提案時應寫什麼</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              清楚說明核心問題、為什麼值得討論、目前可見的爭點，以及未來可能需要哪些證據。
            </p>
          </article>

          <article className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
            <h2 className="text-base font-semibold text-stone-950">提案之後會怎樣</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Level 2 以上可送出提案，Level 3 以上可審查並將提案升格為正式案件。
            </p>
          </article>
        </section>

        <ProposalForm />

        {error ? (
          <section className="rounded-[1.5rem] border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            {error}
          </section>
        ) : null}

        <section className="grid gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
              已提交提案
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">等待審查與升格</h2>
          </div>
          <ProposalsBoard initialProposals={proposals} />
        </section>
      </div>
    </main>
  );
}
