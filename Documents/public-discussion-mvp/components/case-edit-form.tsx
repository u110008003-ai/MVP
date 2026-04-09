"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { getApiErrorMessage } from "@/lib/api-error";
import { roleMeetsRequirement } from "@/lib/roles";
import type { CaseRecord, CaseUpdatePayload } from "@/lib/types";

type CaseEditFormProps = {
  caseItem: CaseRecord;
};

type FieldKey = keyof CaseUpdatePayload;

const fieldLabel: Record<FieldKey, string> = {
  stable_conclusion: "穩定結論",
  confirmed_facts: "已確認事實",
  unsupported_claims: "未支持主張",
  evidence_list: "證據清單",
  open_questions: "開放問題",
};

const transferPresets: Array<{ source: FieldKey; target: FieldKey }> = [
  { source: "evidence_list", target: "stable_conclusion" },
  { source: "confirmed_facts", target: "stable_conclusion" },
  { source: "open_questions", target: "unsupported_claims" },
];

export function CaseEditForm({ caseItem }: CaseEditFormProps) {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [form, setForm] = useState<CaseUpdatePayload>({
    stable_conclusion: caseItem.stable_conclusion,
    confirmed_facts: caseItem.confirmed_facts,
    unsupported_claims: caseItem.unsupported_claims,
    evidence_list: caseItem.evidence_list,
    open_questions: caseItem.open_questions,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function updateField<K extends FieldKey>(field: K, value: CaseUpdatePayload[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function transferField(source: FieldKey, target: FieldKey) {
    const sourceContent = form[source].trim();

    if (!sourceContent) {
      setFeedback(`來源欄位「${fieldLabel[source]}」是空的。`);
      return;
    }

    if (source === target) {
      setFeedback("來源與目標欄位不能相同。");
      return;
    }

    setForm((current) => {
      const targetContent = current[target].trim();
      const sourceBlock = `\n\n[來自 ${fieldLabel[source]}]\n${sourceContent}`;

      return {
        ...current,
        [target]: targetContent
          ? `${targetContent}${sourceBlock}`
          : `[來自 ${fieldLabel[source]}]\n${sourceContent}`,
      };
    });

    setFeedback(`已將「${fieldLabel[source]}」附加到「${fieldLabel[target]}」。`);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    if (!session?.access_token) {
      setFeedback("請先登入後再儲存。");
      return;
    }

    if (!profile?.role || !roleMeetsRequirement(profile.role, "level_3")) {
      setFeedback("只有 Level 3 可以更新 case。");
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

      setFeedback(data.message ?? "Case 已更新。");
    });
  }

  function handleDeleteCase() {
    setFeedback(null);

    if (!session?.access_token) {
      setFeedback("請先登入後再刪除。");
      return;
    }

    if (!profile?.role || !roleMeetsRequirement(profile.role, "level_3")) {
      setFeedback("只有 Level 3 可以刪除 case。");
      return;
    }

    const confirmed = window.confirm(
      `你確定要刪除「${caseItem.title}」嗎？\n這個動作無法復原。`,
    );

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
    <form onSubmit={handleSubmit} className="grid gap-5">
      <section className="rounded-[1.25rem] border border-stone-200 bg-stone-50 p-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
          Block Mixer
        </p>
        <p className="mt-2 text-sm leading-7 text-stone-700">
          快速把不同區塊內容附加到其他欄位，方便整理草稿。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {transferPresets.map((preset) => (
            <button
              key={`${preset.source}-${preset.target}`}
              type="button"
              onClick={() => transferField(preset.source, preset.target)}
              className="rounded-full border border-stone-300 px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-stone-500 hover:bg-white"
            >
              {fieldLabel[preset.source]} to {fieldLabel[preset.target]}
            </button>
          ))}
        </div>
      </section>

      <Field
        label={fieldLabel.stable_conclusion}
        value={form.stable_conclusion}
        onChange={(value) => updateField("stable_conclusion", value)}
        minHeight="min-h-28"
      />
      <Field
        label={fieldLabel.confirmed_facts}
        value={form.confirmed_facts}
        onChange={(value) => updateField("confirmed_facts", value)}
      />
      <Field
        label={fieldLabel.unsupported_claims}
        value={form.unsupported_claims}
        onChange={(value) => updateField("unsupported_claims", value)}
      />
      <Field
        label={fieldLabel.evidence_list}
        value={form.evidence_list}
        onChange={(value) => updateField("evidence_list", value)}
      />
      <Field
        label={fieldLabel.open_questions}
        value={form.open_questions}
        onChange={(value) => updateField("open_questions", value)}
      />

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleDeleteCase}
          disabled={isSaving || isDeleting}
          className="inline-flex items-center justify-center rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-stone-300 disabled:text-stone-400"
        >
          {isDeleting ? "刪除中..." : "刪除案件"}
        </button>

        <button
          type="submit"
          disabled={isSaving || isDeleting}
          className="inline-flex items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {isSaving ? "儲存中..." : "儲存 Case"}
        </button>
      </div>

      {feedback ? (
        <div className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm leading-7 text-stone-700">
          {feedback}
        </div>
      ) : null}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  minHeight = "min-h-40",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-stone-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-[1.25rem] border border-stone-300 bg-white px-4 py-3 text-base leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-950 ${minHeight}`}
      />
    </label>
  );
}
