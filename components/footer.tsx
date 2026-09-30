"use client";

import { useSiteContent } from "@/lib/content";

export function Footer() {
  const f = useSiteContent().footer;
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-[960px] items-center justify-center gap-6 px-6 py-6 text-[12px] text-muted">
        <button className="flex items-center gap-1">
          {f.language_label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <span>{f.copyright_text}</span>
      </div>
    </footer>
  );
}
