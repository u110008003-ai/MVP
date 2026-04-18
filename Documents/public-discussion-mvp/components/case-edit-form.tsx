"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/auth-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { roleMeetsRequirement } from "@/lib/roles";
import type { CaseRecord, CaseUpdatePayload } from "@/lib/types";

type CaseEditFormProps = {
  caseItem: CaseRecord;
};

type FieldKey = keyof CaseUpdatePayload;

const fieldLabel: Record<FieldKey, string> = {
  question: "核心問題",
  narrative_timeline: "事件來龍去脈",
  stable_conclusion: "目前暫定結論",
  confirmed_facts: "已確認事實",
  possible_explanations: "目前可能解釋",
  unsupported_claims: "未支持主張",
  evidence_list: "證據與材料",
  reference_links: "參考連結",
  open_questions: "待確認問題",
  summary_image_url: "總整理圖網址",
  summary_image_note: "總整理圖說明",
};

const transferPresets: Array<{ source: FieldKey; target: FieldKey }> = [
  { source: "evidence_list", target: "stable_conclusion" },
  { source: "confirmed_facts", target: "stable_conclusion" },
  { source: "possible_explanations", target: "stable_conclusion" },
  { source: "open_questions", target: "unsupported_claims" },
  { source: "narrative_timeline", target: "stable_conclusion" },
];

export function CaseEditForm({ caseItem }: CaseEditFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { session, profile } = useAuth();
  const [form, setForm] = useState<CaseUpdatePayload>({
    question: caseItem.question,
    narrative_timeline: caseItem.narrative_timeline,
    stable_conclusion: caseItem.stable_conclusion,
    confirmed_facts: caseItem.confirmed_facts,
    possible_explanations: caseItem.possible_explanations,
    unsupported_claims: caseItem.unsupported_claims,
    evidence_list: caseItem.evidence_list,
    reference_links: caseItem.reference_links,
    open_questions: caseItem.open_questions,
    summary_image_url: caseItem.summary_image_url,
    summary_image_note: caseItem.summary_image_note,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isUploadingImage, startUploadTransition] = useTransition();
  const canEditCase = Boolean(profile?.role && roleMeetsRequirement(profile.role, "level_4"));
  const canDeleteCase = Boolean(profile?.role && roleMeetsRequirement(profile.role, "level_4"));

  function updateField<K extends FieldKey>(field: K, value: CaseUpdatePayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function transferField(source: FieldKey, target: FieldKey) {
    const sourceContent = form[source].trim();

    if (!sourceContent) {
      setFeedback(`「${fieldLabel[source]}」目前沒有內容可移入。`);
      return;
    }

    if (source === target) {
      setFeedback("來源欄位和目標欄位相同，這次沒有進行移動。");
      return;
    }

    setForm((current) => {
      const targetContent = current[target].trim();
      const sourceBlock = `[整理自：${fieldLabel[source]}]\n${sourceContent}`;

      return {
        ...current,
        [target]: targetContent ? `${targetContent}\n\n${sourceBlock}` : sourceBlock,
      };
    });

    setFeedback(`已把「${fieldLabel[source]}」整理進「${fieldLabel[target]}」。`);
  }

  function handleImageUpload(file: File | null) {
    setFeedback(null);

    if (!file) {
      return;
    }

    if (!session?.user || !canEditCase) {
      setFeedback("目前只有管理端可以上傳總整理圖。");
      return;
    }

    if (!supabase) {
      setFeedback("Supabase 尚未完成設定，暫時無法上傳圖片。");
      return;
    }

    startUploadTransition(async () => {
      const extension = file.name.includes(".") ? file.name.split(".").pop() ?? "png" : "png";
      const safeExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
      const filePath = `cases/${caseItem.id}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${safeExtension}`;

      const storage = supabase.storage.from("case-assets");
      const uploadResult = await storage.upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (uploadResult.error) {
        setFeedback(`圖片上傳失敗：${uploadResult.error.message}`);
        return;
      }

      const publicUrl = storage.getPublicUrl(filePath).data.publicUrl;

      setForm((current) => ({
        ...current,
        summary_image_url: publicUrl,
      }));
      setFeedback("圖片已上傳，總整理圖網址已自動帶入。");
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!session?.access_token) {
      setFeedback("請先登入後再儲存案件內容。");
      return;
    }

    if (!canEditCase) {
      setFeedback("目前只有管理端可以編輯正式案件。");
      return;
    }

    startSaveTransition(async () => {
      const response = await fetch(`/api/cases/${caseItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { code?: string; error?: string; message?: string };

      if (!response.ok) {
        setFeedback(getApiErrorMessage(data, response.status));
        return;
      }

      setFeedback(data.message ?? "案件內容已更新。");
      router.refresh();
    });
  }

  function handleDeleteCase() {
    setFeedback(null);

    if (!session?.access_token) {
      setFeedback("請先登入後再刪除案件。");
      return;
    }

    if (!canDeleteCase) {
      setFeedback("目前只有管理端可以刪除正式案件。");
      return;
    }

    const confirmed = window.confirm(`確定要刪除「${caseItem.title}」嗎？這個動作無法復原。`);

    if (!confirmed) {
      return;
    }

    startDeleteTransition(async () => {
      const response = await fetch(`/api/cases/${caseItem.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = (await response.json()) as { code?: string; error?: string; message?: string };

      if (!response.ok) {
        setFeedback(getApiErrorMessage(data, response.status));
        return;
      }

      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <section className="glass-panel grid gap-4 p-5">
        <div className="space-y-2">
          <p className="section-kicker">整理工具</p>
          <h2 className="font-serif text-2xl text-[var(--color-text)]">編輯正式案件</h2>
          <p className="text-sm leading-8 text-[var(--color-text-soft)]">
            這裡是正式案件的總編輯區。你可以把不同板塊的內容抽出、重組，再整理成更穩定的公開版本。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {transferPresets.map((preset) => (
            <button
              key={`${preset.source}-${preset.target}`}
              type="button"
              disabled={!canEditCase || isSaving || isDeleting || isUploadingImage}
              onClick={() => transferField(preset.source, preset.target)}
              className="glass-chip rounded-full px-3 py-2 text-xs font-semibold tracking-[0.08em] text-[var(--color-text-soft)] transition hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
            >
              {fieldLabel[preset.source]} → {fieldLabel[preset.target]}
            </button>
          ))}
        </div>
      </section>

      <Field
        label={fieldLabel.question}
        hint="用一句話說清楚這個案件真正要回答的問題。"
        value={form.question}
        onChange={(value) => updateField("question", value)}
        minHeight="min-h-28"
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.narrative_timeline}
        hint="依時間順序把事件拆開，方便讀者理解事情的來龍去脈。"
        value={form.narrative_timeline}
        onChange={(value) => updateField("narrative_timeline", value)}
        minHeight="min-h-44"
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.stable_conclusion}
        hint="這裡放目前對外公開的暫定結論，文字要穩，不要寫得像情緒發言。"
        value={form.stable_conclusion}
        onChange={(value) => updateField("stable_conclusion", value)}
        minHeight="min-h-32"
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.confirmed_facts}
        value={form.confirmed_facts}
        onChange={(value) => updateField("confirmed_facts", value)}
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.possible_explanations}
        hint="列出目前可能的解釋，但避免把猜測直接寫成定論。"
        value={form.possible_explanations}
        onChange={(value) => updateField("possible_explanations", value)}
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.unsupported_claims}
        value={form.unsupported_claims}
        onChange={(value) => updateField("unsupported_claims", value)}
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.evidence_list}
        value={form.evidence_list}
        onChange={(value) => updateField("evidence_list", value)}
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.reference_links}
        hint="一行一筆參考連結。若內文引用 (1)、(2)，這裡的順序就會對應到引用編號。"
        value={form.reference_links}
        onChange={(value) => updateField("reference_links", value)}
        disabled={!canEditCase}
      />

      <Field
        label={fieldLabel.open_questions}
        value={form.open_questions}
        onChange={(value) => updateField("open_questions", value)}
        disabled={!canEditCase}
      />

      <section className="glass-panel grid gap-4 p-5">
        <div className="space-y-2">
          <p className="section-kicker">總整理圖</p>
          <h3 className="font-serif text-xl text-[var(--color-text)]">圖片與圖說</h3>
          <p className="text-sm leading-8 text-[var(--color-text-soft)]">
            若你有一張能快速幫讀者理解脈絡的整理圖，可以在這裡上傳，或直接貼上圖片網址。
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--color-text-soft)]">上傳圖片</span>
          <input
            type="file"
            accept="image/*"
            disabled={!canEditCase || isUploadingImage || isSaving || isDeleting}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              handleImageUpload(file);
              event.currentTarget.value = "";
            }}
            className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-main)] px-4 py-3 text-sm text-[var(--color-text-soft)] file:mr-3 file:rounded-full file:border-0 file:bg-[var(--color-text)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--color-accent-ink)]"
          />
        </label>

        {isUploadingImage ? (
          <div className="rounded-[1rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-8 text-[var(--color-text-soft)]">
            圖片上傳中...
          </div>
        ) : null}

        <Field
          label={fieldLabel.summary_image_url}
          hint="若不想上傳，也可以直接貼圖片網址。"
          value={form.summary_image_url}
          onChange={(value) => updateField("summary_image_url", value)}
          minHeight="min-h-0"
          disabled={!canEditCase}
        />
      </section>

      <Field
        label={fieldLabel.summary_image_note}
        hint="補充這張圖要怎麼看、各區塊代表什麼。"
        value={form.summary_image_note}
        onChange={(value) => updateField("summary_image_note", value)}
        minHeight="min-h-24"
        disabled={!canEditCase}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        {canDeleteCase ? (
          <button
            type="button"
            onClick={handleDeleteCase}
            disabled={isSaving || isDeleting || isUploadingImage}
            className="inline-flex items-center justify-center rounded-full border border-[#d8c3bc] bg-[var(--color-surface-main)] px-5 py-3 text-sm font-semibold text-[#8d4d3d] transition hover:bg-[#f4eeea] disabled:cursor-not-allowed disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)]"
          >
            {isDeleting ? "刪除中..." : "刪除案件"}
          </button>
        ) : null}

        <button
          type="submit"
          disabled={!canEditCase || isSaving || isDeleting || isUploadingImage}
          className="inline-flex items-center justify-center rounded-full bg-[var(--color-text)] px-5 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[var(--color-text-muted)]"
        >
          {isSaving ? "儲存中..." : "儲存案件"}
        </button>
      </div>

      {feedback ? (
        <div className="rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm leading-8 text-[var(--color-text-soft)]">
          {feedback}
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  minHeight = "min-h-40",
  disabled = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-3">
      <span className="font-serif text-xl text-[var(--color-text)]">{label}</span>
      {hint ? <span className="text-sm leading-8 text-[var(--color-text-muted)]">{hint}</span> : null}
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-surface-main)] px-5 py-4 text-base leading-8 text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-gold)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-text-muted)] ${minHeight}`}
      />
    </label>
  );
}
