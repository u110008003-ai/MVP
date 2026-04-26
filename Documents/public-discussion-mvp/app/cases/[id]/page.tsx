import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseRoleActions } from "@/components/case-role-actions";
import { CollapsibleContentSection } from "@/components/collapsible-content-section";
import {
  parseReferenceLinks,
  ReferenceAwareText,
  type ReferenceEntry,
} from "@/components/reference-aware-text";
import { RevisionsPanel } from "@/components/revisions-panel";
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

const statusLabel: Record<CaseStatus, string> = {
  draft: "草稿",
  proposal: "提案中",
  formal: "正式案件",
};

const submissionTypeLabel: Record<SubmissionType, string> = {
  evidence: "證據",
  error: "錯誤修正",
  inference: "推論補充",
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
  const references = parseReferenceLinks(caseItem.reference_links);
  const narrativeSideA = caseItem.narrative_side_a?.trim() || caseItem.narrative_timeline?.trim() || "";
  const narrativeSideB = caseItem.narrative_side_b?.trim() || "";

  return (
    <main className="page-shell min-h-screen px-6 py-10 text-[var(--color-text)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Link
          href="/"
          className="glass-chip inline-flex w-fit rounded-full px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
        >
          回到首頁
        </Link>

        <section className="glass-panel-strong rounded-[2rem] p-8">
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

          <div className="mt-5 grid gap-3 text-sm text-[var(--color-text-muted)] sm:grid-cols-2">
            <AttributionCard
              label="原始提案者"
              value={caseItem.created_by_profile?.display_name ?? "尚未紀錄"}
            />
            <AttributionCard
              label="升格整理者"
              value={caseItem.promoted_by_profile?.display_name ?? "尚未紀錄"}
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="glass-panel rounded-[1.5rem] p-6">
              <p className="border-l border-[oklch(0.74_0.02_80_/_0.2)] pl-3 text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
                核心問題
              </p>
              <div className="mt-4">
                <ReferenceAwareText value={caseItem.question} tone="neutral" references={references} />
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[color:var(--color-line-strong)] bg-[color:var(--color-surface-chip)] p-6">
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-gold)]">
                目前暫定結論
              </p>
              <div className="mt-4 text-lg leading-8 text-[var(--color-text)]">
                <ReferenceAwareText value={caseItem.stable_conclusion} tone="gold" references={references} />
              </div>
            </article>
          </div>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-[var(--color-gold)]/20 bg-[var(--color-gold-muted)] p-5 text-sm leading-7 text-[var(--color-text)]">
            {error}
          </section>
        ) : null}

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Narrative</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">雙方觀點脈絡</h2>
            </div>
            <p className="muted-copy max-w-2xl text-sm">
              這裡把原本單一的來龍去脈拆成兩塊，方便並排整理雙方視角。你可以拿來放甲方 / 乙方、
              支持 / 反對，或任何兩組需要對照的敘事。
            </p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <article className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] p-5">
              <p className="section-kicker">Viewpoint A</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-text)]">觀點 A</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                建議放其中一方的事件整理與關鍵節點。
              </p>
              <div className="mt-5">
                <TimelineExplorer value={narrativeSideA} />
              </div>
            </article>

            <article className="rounded-[1.5rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] p-5">
              <p className="section-kicker">Viewpoint B</p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-text)]">觀點 B</h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                建議放另一方的事件整理與不同版本敘事。
              </p>
              <div className="mt-5">
                <TimelineExplorer value={narrativeSideB} />
              </div>
            </article>
          </div>
        </section>

        <section className="grid gap-4">
          <CollapsibleContentSection
            label="已確認事實"
            description="這裡只放目前有依據、能被查證的內容。"
            value={caseItem.confirmed_facts}
            tone="success"
            references={references}
            defaultOpen
          />
          <CollapsibleContentSection
            label="目前可能解釋"
            description="列出目前合理的解釋方向，但不要把猜測直接寫成定論。"
            value={caseItem.possible_explanations}
            tone="info"
            references={references}
          />
          <CollapsibleContentSection
            label="未支持主張"
            description="放目前常被講，但證據還不足的說法。"
            value={caseItem.unsupported_claims}
            tone="warning"
            references={references}
          />
          <CollapsibleContentSection
            label="證據與材料"
            description="這裡放目前已整理進案件的證據、材料與線索。"
            value={caseItem.evidence_list}
            tone="neutral"
            references={references}
          />
          <CollapsibleContentSection
            label="待確認問題"
            description="列出目前還沒查清楚、需要再補的地方。"
            value={caseItem.open_questions}
            tone="neutral"
            references={references}
          />
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Reference Links</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">參考連結</h2>
            </div>
            <p className="muted-copy max-w-2xl text-sm">
              如果內文有 (1)(2) 這類編號，這裡就是它們對應的來源列表。
            </p>
          </div>

          <div className="mt-6">
            <ReferenceLinks references={references} />
          </div>
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Overview Graphic</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">總整理圖</h2>
            </div>
            <p className="muted-copy max-w-2xl text-sm">
              若這個案件有一張能快速幫讀者理解脈絡的圖，會放在這裡。
            </p>
          </div>

          {caseItem.summary_image_url ? (
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] p-4">
              <img
                src={caseItem.summary_image_url}
                alt={`${caseItem.title} 總整理圖`}
                className="w-full rounded-[1rem] border border-[color:var(--color-border)] object-contain"
              />
              {caseItem.summary_image_note ? (
                <p className="mt-4 text-sm leading-7 text-[var(--color-text-muted)]">
                  {caseItem.summary_image_note}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 p-6 text-sm leading-7 text-[var(--color-text-muted)]">
              目前還沒有總整理圖。之後若整理出圖解脈絡，可以再補進來。
            </div>
          )}
        </section>

        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="section-kicker">Accepted Submissions</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">已採納的補充內容</h2>
            </div>

            <CaseRoleActions caseId={caseItem.id} />
          </div>

          {acceptedError ? (
            <div className="mt-5 rounded-[1.25rem] border border-[color:var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-7 text-[var(--color-text)]">
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
                  className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] p-5"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-success)]">
                      已採納
                    </span>
                    <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--color-text)]">
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

        <RevisionsPanel revisions={revisions} error={revisionsError} />

        <SubmissionPanel caseId={caseItem.id} />
      </div>
    </main>
  );
}

function AttributionCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseStatus }) {
  if (status === "formal") {
    return (
      <span className="rounded-full bg-[var(--color-gold)] px-3 py-1 text-sm font-semibold text-[var(--color-surface-deep)] shadow-[0_0_8px_rgba(251,191,36,0.3)]">
        {statusLabel[status]}
      </span>
    );
  }

  if (status === "proposal") {
    return (
      <span className="rounded-full border border-[var(--color-gold)]/20 bg-[var(--color-gold-muted)] px-3 py-1 text-sm font-semibold text-[var(--color-gold)]">
        {statusLabel[status]}
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[color:var(--color-border)] bg-[var(--color-surface-card)] px-3 py-1 text-sm font-semibold text-[var(--color-text-muted)]">
      {statusLabel[status]}
    </span>
  );
}

function ReferenceLinks({ references }: { references: ReferenceEntry[] }) {
  if (references.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-white/15 p-6 text-sm leading-7 text-[var(--color-text-muted)]">
        目前還沒有參考連結。
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {references.map((reference) => (
        <a
          key={reference.index}
          id={`reference-${reference.index}`}
          href={reference.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-[1.25rem] border border-[color:var(--color-border)] bg-[var(--color-surface-card)] px-4 py-3 text-sm leading-7 text-[var(--color-text)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
        >
          <span className="mr-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-surface-muted)] px-2 text-xs font-semibold text-[var(--color-gold)]">
            ({reference.index})
          </span>
          <span>{reference.label}</span>
        </a>
      ))}
    </div>
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
