import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseEditForm } from "@/components/case-edit-form";
import { getAcceptedSubmissionsForCase, getCaseByIdForEditor } from "@/lib/cases";
import { requirePageRole } from "@/lib/server-auth";
import { SubmissionType } from "@/lib/types";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const submissionTypeLabel: Record<SubmissionType, string> = {
  evidence: "證據",
  error: "錯誤指認",
  inference: "推論",
};

export default async function CaseEditPage({ params }: PageProps) {
  const actor = await requirePageRole("level_4");
  const { id } = await params;
  const { caseItem } = await getCaseByIdForEditor(actor.access_token, id);

  if (!caseItem) {
    notFound();
  }

  const { submissions } = await getAcceptedSubmissionsForCase(caseItem.id);

  return (
    <main className="page-shell min-h-screen px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">Case Editor</p>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--color-text)]">編輯案件內容</h1>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/cases/${caseItem.id}`}
              className="glass-chip inline-flex rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
            >
              返回案件頁
            </Link>
            <Link
              href="/admin/submissions"
              className="glass-chip inline-flex rounded-full px-4 py-2 text-sm font-medium text-[var(--color-text-soft)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-text)]"
            >
              前往 submissions 管理
            </Link>
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-panel-strong rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold text-[var(--color-text)]">{caseItem.title}</h2>
            <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-[var(--color-text-muted)]">
              {caseItem.question}
            </p>

            <div className="glass-chip mt-6 rounded-[1.25rem] p-4 text-sm leading-7 text-[var(--color-text-soft)]">
              你現在可以直接補上事件來龍去脈、總整理圖網址和圖說。來龍去脈建議一行寫一個時間點，
              之後在案件頁就能逐行點開看。
            </div>

            <div className="mt-6">
              <CaseEditForm caseItem={caseItem} />
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] p-6">
            <p className="section-kicker">Accepted Submissions</p>
            <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">已採納的補充內容</h2>

            <div className="mt-6 grid gap-3">
              {submissions.length === 0 ? (
                <div className="rounded-[1.25rem] border border-dashed border-[color:var(--color-border)] p-5 text-sm leading-7 text-[var(--color-text-muted)]">
                  目前還沒有已採納的 submissions。
                </div>
              ) : (
                submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                        已採納
                      </span>
                      <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                        {submissionTypeLabel[submission.type]}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text-soft)]">
                      {submission.content}
                    </p>

                    {submission.source_url ? (
                      <a
                        href={submission.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-[var(--color-gold)] underline decoration-[var(--color-gold)]/40 underline-offset-4"
                      >
                        查看來源
                      </a>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
