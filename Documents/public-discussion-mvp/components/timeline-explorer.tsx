"use client";

import { useMemo, useState } from "react";

function normalizeLine(line: string) {
  const trimmed = line.trim();

  if (trimmed.startsWith("- ")) {
    return trimmed.slice(2).trim();
  }

  return trimmed;
}

function getHeadline(text: string) {
  const firstBreak = text.search(/[：:]/);
  const base = firstBreak >= 0 ? text.slice(0, firstBreak) : text;
  return base.length > 36 ? `${base.slice(0, 36)}...` : base;
}

export function TimelineExplorer({ value }: { value: string }) {
  const items = useMemo(
    () =>
      value
        .split("\n")
        .map(normalizeLine)
        .filter(Boolean),
    [value],
  );

  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) {
    return (
      <div className="rounded-[1.25rem] border border-dashed border-white/15 p-5 text-sm leading-7 text-[var(--color-text-muted)]">
        目前還沒有整理事件來龍去脈。
      </div>
    );
  }

  const activeItem = items[activeIndex] ?? items[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
      <div className="grid gap-2">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={`${index}-${item}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-[1rem] border px-4 py-3 text-left text-sm leading-6 transition ${
                isActive
                  ? "border-[var(--color-gold)] bg-[color-mix(in_oklch,#d19900_10%,#1c1b19)] text-[var(--color-text)]"
                  : "border-white/10 bg-[var(--color-surface-card)] text-[var(--color-text-muted)] hover:border-white/20 hover:text-[var(--color-text)]"
              }`}
            >
              <span className="mr-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-black/20 px-2 text-xs font-semibold">
                {index + 1}
              </span>
              {getHeadline(item)}
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-[var(--color-surface-card)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-text-muted)]">
          單行細看
        </p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
          目前選到第 {activeIndex + 1} 段，共 {items.length} 段。
        </p>
        <p className="mt-4 whitespace-pre-wrap text-lg leading-8 text-[var(--color-text)]">
          {activeItem}
        </p>
      </div>
    </div>
  );
}
