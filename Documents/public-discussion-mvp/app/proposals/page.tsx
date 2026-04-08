import Link from "next/link";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalsBoard } from "@/components/proposals-board";
import { getProposals } from "@/lib/cases";

export default async function ProposalsPage() {
  const { proposals, error } = await getProposals();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f5f1e8_0%,#fbfaf7_24%,#ffffff_100%)] px-6 py-10 text-stone-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">
              Proposals
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-950">提案區</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
              Level 2 可新增提案，Level 3 可將提案升格為正式 case。
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950"
          >
            回首頁
          </Link>
        </div>

        <ProposalForm />

        {error ? (
          <section className="rounded-[1.5rem] border border-amber-300 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
            {error}
          </section>
        ) : null}

        <ProposalsBoard initialProposals={proposals} />
      </div>
    </main>
  );
}
