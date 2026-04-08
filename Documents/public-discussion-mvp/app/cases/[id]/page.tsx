import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseRoleActions } from "@/components/case-role-actions";
import { SubmissionPanel } from "@/components/submission-panel";
import {
  getAcceptedSubmissionsForCase,
  getCaseById,
  getRevisionsForCase,
} from "@/lib/cases";
import { CaseStatus, SubmissionType } from "@/lib/types";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

const statusLabel: Record<CaseStatus, string> = {
  draft: "草稿",
  proposal: "提案中",
  formal: "正式",
};

const submissionTypeLabel: Record<SubmissionType, string> = {
  evidence: "證據",
  error: "修正",
  inference: "推論",
};

export default async function CaseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { caseItem, source, error } = await getCaseById(id);

  if (!caseItem) {
    notFound();
  }

  const { submissions: acceptedSubmissions, error: acceptedError } =
    await getAcceptedSubmissionsForCase(caseItem.id);
  const { revisions, error: revisionsError } = await getRevisionsForCase(caseItem.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#292524_0%,#0c0a09_55%,#020617_100%)] px-6 py-10 text-stone-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit rounded-full border border-stone-700 px-4 py-2 text-sm text-stone-300 transition hover:border-amber-400 hover:text-amber-300"
        >
          回到首頁
        </Link>

        <section className="rounded-[2rem] border border-stone-800 bg-white/5 p-8 shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-300">
              {statusLabel[caseItem.status]}
            </span>
            <span className="text-sm text-stone-400">
              資料來源：{source === "supabase" ? "Supabase" : "本地範例"}
            </span>
            <span className="text-sm text-stone-400">
              最後更新：{formatDate(caseItem.updated_at)}
            </span>
            <CaseRoleActions caseId={caseItem.id} />
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-white">
            {caseItem.title}
          </h1>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.5rem] border border-stone-800 bg-stone-950/65 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                核心問題
              </p>
              <div className="mt-4">
                <FormattedText value={caseItem.question} />
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-200/80">
                穩定結論
              </p>
              <div className="mt-4 text-lg leading-8 text-amber-50">
                <FormattedText value={caseItem.stable_conclusion} />
              </div>
            </article>
          </div>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-amber-500/40 bg-amber-500/10 p-5 text-sm leading-7 text-amber-100">
            {error}
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <FieldCard label="已確認事實" value={caseItem.confirmed_facts} />
          <FieldCard label="未支持主張" value={caseItem.unsupported_claims} />
          <FieldCard label="證據清單" value={caseItem.evidence_list} />
          <FieldCard label="開放問題" value={caseItem.open_questions} />
        </section>

        <section className="rounded-[2rem] border border-stone-800 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
                Accepted Submissions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                已接受的補充內容
              </h2>
            </div>

            <CaseRoleActions caseId={caseItem.id} />
          </div>

          {acceptedError ? (
            <div className="mt-5 rounded-[1.25rem] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-100">
              {acceptedError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {acceptedSubmissions.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-stone-700 p-5 text-sm leading-7 text-stone-400">
                目前沒有已接受的 submissions。
              </div>
            ) : (
              acceptedSubmissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-[1.25rem] border border-stone-800 bg-stone-950/50 p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                      已接受
                    </span>
                    <span className="rounded-full bg-stone-800 px-3 py-1 text-xs font-semibold text-stone-200">
                      {submissionTypeLabel[submission.type]}
                    </span>
                    <span className="text-sm text-stone-500">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-stone-200">
                    {submission.content}
                  </p>

                  {submission.source_url ? (
                    <a
                      href={submission.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-medium text-amber-300 underline decoration-amber-500/40 underline-offset-4"
                    >
                      查看來源
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-stone-800 bg-white/5 p-6 backdrop-blur">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
            Revision History
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">修訂紀錄</h2>

          {revisionsError ? (
            <div className="mt-5 rounded-[1.25rem] border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm leading-7 text-amber-100">
              {revisionsError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {revisions.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-stone-700 p-5 text-sm leading-7 text-stone-400">
                目前沒有修訂紀錄。
              </div>
            ) : (
              revisions.map((revision) => (
                <article
                  key={revision.id}
                  className="rounded-[1.25rem] border border-stone-800 bg-stone-950/50 p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold text-white">{revision.summary}</h3>
                    <span className="text-sm text-stone-500">
                      {formatDateTime(revision.created_at)}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-stone-300">
                    {revision.detail}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>

        <SubmissionPanel caseId={caseItem.id} />
      </div>
    </main>
  );
}

function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.5rem] border border-stone-800 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-sm font-medium uppercase tracking-[0.24em] text-stone-500">
        {label}
      </h2>
      <div className="mt-4">
        <FormattedText value={value} />
      </div>
    </article>
  );
}

function FormattedText({ value }: { value: string }) {
  const content = value?.trim();

  if (!content) {
    return <p className="text-base leading-8 text-stone-300">（空）</p>;
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const isBulletList = lines.every((line) => line.startsWith("- "));

  if (isBulletList) {
    return (
      <ul className="space-y-3 text-base leading-8 text-stone-200">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
            <span>{line.slice(2)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-wrap text-base leading-8 text-stone-200">{content}</p>;
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

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知";
  }
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
