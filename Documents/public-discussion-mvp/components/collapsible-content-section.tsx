import { ReferenceAwareText, type ReferenceEntry } from "@/components/reference-aware-text";
type Tone = "neutral" | "gold" | "success" | "warning" | "info";

export function CollapsibleContentSection({
  label,
  description,
  value,
  tone,
  references,
  defaultOpen = false,
  compact = false,
  badge,
  surface = "light",
}: {
  label: string;
  description?: string;
  value: string;
  tone: Tone;
  references: ReferenceEntry[];
  defaultOpen?: boolean;
  compact?: boolean;
  badge?: string;
  surface?: "dark" | "light";
}) {
  const isDark = surface === "dark";
  const cardClass =
    tone === "success"
      ? isDark
        ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
        : "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
      : tone === "warning"
        ? isDark
          ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
          : "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
        : tone === "gold"
          ? isDark
            ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
            : "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
          : tone === "info"
            ? isDark
              ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
              : "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
            : isDark
              ? "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]"
              : "border-[color:var(--color-border)] bg-[color:var(--color-surface-card)]";

  const titleClass =
    tone === "success"
      ? "text-[var(--color-success)]"
      : tone === "warning"
        ? "text-[var(--color-warning)]"
        : tone === "gold"
          ? "text-[var(--color-gold)]"
          : tone === "info"
            ? "text-[oklch(0.75_0.12_245)]"
            : "text-[var(--color-text-muted)]";

  return (
    <details open={defaultOpen} className={`group rounded-[1.5rem] border ${cardClass}`}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-sm font-medium uppercase tracking-[0.24em] ${titleClass}`}>{label}</h2>
            {badge ? (
              <span className="rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-muted)] px-2 py-1 text-[11px] font-semibold text-[var(--color-text-muted)]">
                {badge}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className={`mt-2 text-sm leading-7 ${isDark ? "text-[var(--color-text-muted)]" : "text-stone-500"}`}>
              {description}
            </p>
          ) : null}
        </div>
        <span className={`text-sm transition group-open:rotate-180 ${isDark ? "text-[var(--color-text-muted)]" : "text-stone-500"}`}>
          ▾
        </span>
      </summary>

      <div className={`px-5 pb-5 pt-4 ${isDark ? "border-t border-[color:var(--color-border)]" : "border-t border-stone-200"}`}>
        <ReferenceAwareText value={value} tone={tone} references={references} compact={compact} />
      </div>
    </details>
  );
}
