"use client";

import { useAppreciations } from "@/lib/content";
import type { Appreciation } from "@/lib/types";

export default function AppreciationsPage() {
  const items = useAppreciations();

  // Split into two visual columns, alternating so lengths balance.
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  return (
    <section className="grid grid-cols-1 gap-6 pt-8 md:grid-cols-2">
      <Column items={left} startDelay={0} />
      <Column items={right} startDelay={60} />
    </section>
  );
}

function Column({
  items,
  startDelay,
}: {
  items: Appreciation[];
  startDelay: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      {items.map((t, i) => (
        <blockquote
          key={t.id}
          className="rounded-lg border border-border bg-surface/60 p-6 animate-fade-up"
          style={{ animationDelay: `${startDelay + i * 60}ms` }}
        >
          <QuoteMark />
          <p className="mt-1 text-[13px] italic leading-relaxed text-ink/85">
            {t.quote}
          </p>
          <div className="mt-4 border-t border-border pt-3">
            <div className="text-[13px] font-semibold text-ink">{t.author}</div>
            <div className="text-[11px] text-muted">{t.role}</div>
          </div>
        </blockquote>
      ))}
    </div>
  );
}

function QuoteMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-muted/60"
      aria-hidden="true"
    >
      <path
        d="M7 7h4v4H7c0 3 1 4 3 4v2c-4 0-6-2-6-6V7zm10 0h4v4h-4c0 3 1 4 3 4v2c-4 0-6-2-6-6V7z"
        fill="currentColor"
      />
    </svg>
  );
}
