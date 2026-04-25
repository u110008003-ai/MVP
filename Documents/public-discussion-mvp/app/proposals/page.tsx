import Link from "next/link";
import { ProposalForm } from "@/components/proposal-form";
import { ProposalsBoard } from "@/components/proposals-board";
import { getProposals } from "@/lib/cases";

export const dynamic = "force-dynamic";

export default async function ProposalsPage() {
  const { proposals, error } = await getProposals();

  return (
    <main className="page-shell min-h-screen px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Proposal Drafts</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">提案草稿池</h1>
            <p className="muted-copy mt-3 max-w-2xl text-sm">
              proposal 是正式案件前的整理區。現在只要 Level 1 就能先把議題丟進來，之後再由社群補強內容，
              讓管理端判斷是否適合升格。
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-main)] px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[color:var(--color-accent)] hover:text-[var(--color-text)]"
          >
            回到首頁
          </Link>
        </div>

        <section className="glass-panel-strong grid gap-4 rounded-[2rem] p-6 md:grid-cols-3">
          <article className="glass-chip rounded-[1.25rem] p-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">先把題目丟進來</h2>
            <p className="muted-copy mt-2 text-sm">
              不用一開始就寫得完美。先把你認為值得討論的議題整理成草稿，之後再慢慢補強。
            </p>
          </article>

          <article className="glass-chip rounded-[1.25rem] p-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">草稿會被分板塊</h2>
            <p className="muted-copy mt-2 text-sm">
              提案不是一整團文字，而是拆成不同欄位，方便之後對應到正式案件的結構。
            </p>
          </article>

          <article className="glass-chip rounded-[1.25rem] p-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">目前權限</h2>
            <p className="muted-copy mt-2 text-sm">
              Level 1 就可以建立與補充提案。Level 3 之後可審看提案是否成熟，並決定是否升格成正式案件。
            </p>
          </article>
        </section>

        <ProposalForm />

        {error ? (
          <section className="glass-chip rounded-[1.5rem] border-[color:var(--color-line-strong)] p-5 text-sm leading-7 text-[var(--color-text-soft)]">
            {error}
          </section>
        ) : null}

        <section className="grid gap-2">
          <div>
            <p className="section-kicker">Proposal Board</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">目前公開的提案</h2>
          </div>
          <ProposalsBoard initialProposals={proposals} />
        </section>
      </div>
    </main>
  );
}
