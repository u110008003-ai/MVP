import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseRoleActions } from "@/components/case-role-actions";
import { SubmissionPanel } from "@/components/submission-panel";
import { TimelineExplorer } from "@/components/timeline-explorer";
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

type CardTone = "neutral" | "gold" | "success" | "warning";

const statusLabel: Record<CaseStatus, string> = {
  draft: "草稿",
  proposal: "提案中",
  formal: "正式",
};

const submissionTypeLabel: Record<SubmissionType, string> = {
  evidence: "證據",
  error: "錯誤指認",
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
    <main className="min-h-screen bg-[var(--color-surface-deep)] px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/"
          className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
        >
          返回首頁
        </Link>

        <section className="rounded-[2rem] border border-white/10 bg-[var(--color-surface-main)] p-8 shadow-[0_24px_80px_-36px_rgba(0,0,0,0.7)]">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={caseItem.status} />
            <span className="text-sm text-[var(--color-text-muted)]">
              資料來源：{source === "supabase" ? "Supabase" : "樣本資料"}
            </span>
            <span className="text-sm text-[var(--color-text-muted)]">
              最後更新：{formatDate(caseItem.updated_at)}
            </span>
            <CaseRoleActions caseId={caseItem.id} />
          </div>

          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight text-[var(--color-text)]">
            {caseItem.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            提案主題：<span className="font-bold text-[var(--color-text)]">{caseItem.title}</span>
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[1.5rem] border border-[oklch(0.72_0.02_80_/_0.2)] bg-[#1e1d1b] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
              <p className="border-l border-[oklch(0.74_0.02_80_/_0.2)] pl-3 text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                核心問題
              </p>
              <div className="mt-4">
                <FormattedText value={caseItem.question} tone="neutral" />
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[oklch(0.75_0.15_80_/_0.25)] bg-[color-mix(in_oklch,#d19900_8%,#1c1b19)] p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-gold)]">
                穩定結論
              </p>
              <div className="mt-4 text-lg leading-8 text-[var(--color-text)]">
                <FormattedText value={caseItem.stable_conclusion} tone="gold" />
              </div>
            </article>
          </div>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-[oklch(0.75_0.15_80_/_0.25)] bg-[color-mix(in_oklch,#d19900_8%,#1c1b19)] p-5 text-sm leading-7 text-[var(--color-text)]">
            {error}
          </section>
        ) : null}

        <section className="rounded-[2rem] border border-white/10 bg-[var(--color-surface-main)] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                Narrative
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                事件來龍去脈
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              這個區塊會把整件事拆成多行，每一行都能單獨點開檢視，方便逐段討論。
            </p>
          </div>

          <div className="mt-6">
            <TimelineExplorer value={caseItem.narrative_timeline} />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <FieldCard label="已確認事實" value={caseItem.confirmed_facts} tone="success" />
          <FieldCard label="未支持主張" value={caseItem.unsupported_claims} tone="warning" />
          <FieldCard label="證據與材料" value={caseItem.evidence_list} tone="neutral" />
          <FieldCard label="待確認問題" value={caseItem.open_questions} tone="neutral" />
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[var(--color-surface-main)] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                Overview Graphic
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">總整理圖</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-muted)]">
              可以放流程圖、關係圖、時間軸整理圖，讓第一次進來的人先快速看懂整體脈絡。
            </p>
          </div>

          {caseItem.summary_image_url ? (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[var(--color-surface-card)] p-4">
              <img
                src={caseItem.summary_image_url}
                alt={`${caseItem.title} 總整理圖`}
                className="w-full rounded-[1rem] border border-white/10 object-contain"
              />
              {caseItem.summary_image_note ? (
                <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                  {caseItem.summary_image_note}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 p-6 text-sm leading-7 text-[var(--color-text-muted)]">
              目前還沒有放總整理圖。你可以到案件編輯頁補上一張圖片網址和圖說。
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[var(--color-surface-main)] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                Accepted Submissions
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                已採納的補充內容
              </h2>
            </div>

            <CaseRoleActions caseId={caseItem.id} />
          </div>

          {acceptedError ? (
            <div className="mt-5 rounded-[1.25rem] border border-[oklch(0.65_0.1_40_/_0.2)] bg-[color-mix(in_oklch,#bb653b_6%,#1c1b19)] px-4 py-3 text-sm leading-7 text-[var(--color-text)]">
              {acceptedError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {acceptedSubmissions.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-white/15 p-5 text-sm leading-7 text-[var(--color-text-muted)]">
                目前還沒有已採納的 submissions。
              </div>
            ) : (
              acceptedSubmissions.map((submission) => (
                <article
                  key={submission.id}
                  className="rounded-[1.25rem] border border-white/10 bg-[var(--color-surface-card)] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[color-mix(in_oklch,#6daa45_22%,#1c1b19)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                      已採納
                    </span>
                    <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
                      {submissionTypeLabel[submission.type]}
                    </span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[var(--color-text)]">
                    {submission.content}
                  </p>

                  {submission.source_url ? (
                    <a
                      href={submission.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-sm font-medium text-[var(--color-gold)] underline decoration-[var(--color-gold)]/40 underline-offset-4"
                    >
                      查看來源
                    </a>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-[var(--color-surface-main)] p-6">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
            Revision History
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">修訂紀錄</h2>

          {revisionsError ? (
            <div className="mt-5 rounded-[1.25rem] border border-[oklch(0.65_0.1_40_/_0.2)] bg-[color-mix(in_oklch,#bb653b_6%,#1c1b19)] px-4 py-3 text-sm leading-7 text-[var(--color-text)]">
              {revisionsError}
            </div>
          ) : null}

          <div className="mt-6 grid gap-3">
            {revisions.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-white/15 p-5 text-sm leading-7 text-[var(--color-text-muted)]">
                目前還沒有修訂紀錄。
              </div>
            ) : (
              revisions.map((revision) => (
                <article
                  key={revision.id}
                  className="rounded-[1.25rem] border border-white/10 bg-[var(--color-surface-card)] p-5"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold text-[var(--color-text)]">{revision.summary}</h3>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      {formatDateTime(revision.created_at)}
                    </span>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[var(--color-text)]">
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

function StatusBadge({ status }: { status: CaseStatus }) {
  if (status === "formal") {
    return (
      <span className="rounded-full bg-[var(--color-gold)] px-3 py-1 text-sm font-semibold text-[#1c1b00] shadow-[0_0_8px_oklch(0.75_0.15_80_/_0.3)]">
        {statusLabel[status]}
      </span>
    );
  }

  if (status === "proposal") {
    return (
      <span className="rounded-full border border-[oklch(0.75_0.15_80_/_0.2)] bg-[color-mix(in_oklch,#d19900_6%,#1c1b19)] px-3 py-1 text-sm font-semibold text-[var(--color-gold)]">
        {statusLabel[status]}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/15 bg-[var(--color-surface-card)] px-3 py-1 text-sm font-semibold text-[var(--color-text-muted)]">
      {statusLabel[status]}
    </span>
  );
}

function FieldCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: CardTone;
}) {
  const cardClass =
    tone === "success"
      ? "border-[oklch(0.65_0.12_140_/_0.2)] bg-[color-mix(in_oklch,#6daa45_6%,#1c1b19)]"
      : tone === "warning"
        ? "border-[oklch(0.65_0.1_40_/_0.2)] bg-[color-mix(in_oklch,#bb653b_6%,#1c1b19)]"
        : tone === "gold"
          ? "border-[oklch(0.75_0.15_80_/_0.25)] bg-[color-mix(in_oklch,#d19900_8%,#1c1b19)]"
          : "border-white/10 bg-[var(--color-surface-card)]";

  const titleClass =
    tone === "success"
      ? "text-[var(--color-success)]"
      : tone === "warning"
        ? "text-[var(--color-warning)]"
        : tone === "gold"
          ? "text-[var(--color-gold)]"
          : "text-[var(--color-text-muted)]";

  return (
    <article className={`rounded-[1.5rem] border p-6 ${cardClass}`}>
      <h2 className={`text-sm font-medium uppercase tracking-[0.24em] ${titleClass}`}>
        {label}
      </h2>
      <div className="mt-4">
        <FormattedText value={value} tone={tone} />
      </div>
    </article>
  );
}

function FormattedText({ value, tone }: { value: string; tone: CardTone }) {
  const content = value?.trim();

  if (!content) {
    return <p className="text-base leading-8 text-[var(--color-text-muted)]">尚未整理</p>;
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const isBulletList = lines.every((line) => line.startsWith("- "));
  const bulletColorClass =
    tone === "success"
      ? "bg-[var(--color-success)]"
      : tone === "warning"
        ? "bg-[var(--color-warning)]"
        : tone === "gold"
          ? "bg-[var(--color-gold)]"
          : "bg-[var(--color-text-muted)]";

  if (isBulletList) {
    return (
      <ul className="space-y-3 text-base leading-8 text-[var(--color-text)]">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className={`mt-3 h-1.5 w-1.5 shrink-0 rounded-full ${bulletColorClass}`} />
            <span>{line.slice(2)}</span>
          </li>
        ))}
      </ul>
    );
  }

  return <p className="whitespace-pre-wrap text-base leading-8 text-[var(--color-text)]">{content}</p>;
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
