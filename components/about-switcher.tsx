"use client";

import { useEffect, useMemo, useState } from "react";
import type { TimelineEntry } from "@/lib/types";
import { useSiteContent } from "@/lib/content";

export function AboutSwitcher({ timeline }: { timeline: TimelineEntry[] }) {
  const [tab, setTab] = useState<"about" | "timeline">("about");

  return (
    <div className="mt-8 grid grid-cols-1 items-start gap-8 md:mt-10 md:grid-cols-[1fr_260px]">
      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[22px] font-semibold text-ink">
            {tab === "about" ? "About" : "Timeline"}
          </h2>
          <SegmentedToggle tab={tab} onChange={setTab} />
        </div>

        {tab === "about" ? <AboutBody /> : <Timeline entries={timeline} />}
      </div>

      <SidePanel />
    </div>
  );
}

function SegmentedToggle({
  tab,
  onChange,
}: {
  tab: "about" | "timeline";
  onChange: (t: "about" | "timeline") => void;
}) {
  return (
    <div
      role="tablist"
      className="inline-flex self-start rounded-full border border-border bg-surface p-1 text-[13px] sm:self-auto"
    >
      {(["about", "timeline"] as const).map((key) => {
        const active = tab === key;
        return (
          <button
            role="tab"
            aria-selected={active}
            key={key}
            onClick={() => onChange(key)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 transition-colors ${
              active ? "bg-bg text-ink shadow-soft" : "text-muted"
            }`}
          >
            {key === "about" ? <MenuIcon /> : <CalendarIcon />}
            <span className={active ? "font-semibold" : ""}>
              {key === "about" ? "About" : "Timeline"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------ Typewriter ------------------------ */

type Section =
  | { kind: "p"; text: string }
  | { kind: "quote"; text: string }
  | { kind: "sig"; text: string };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const listener = () => setReduced(mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function useTypewriter(totalChars: number, charsPerTick: number, tickMs: number) {
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(reduced ? totalChars : 0);

  useEffect(() => {
    if (reduced) {
      setRevealed(totalChars);
      return;
    }
    setRevealed(0);
    const id = setInterval(() => {
      setRevealed((r) => {
        const nxt = r + charsPerTick;
        if (nxt >= totalChars) {
          clearInterval(id);
          return totalChars;
        }
        return nxt;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [totalChars, charsPerTick, tickMs, reduced]);

  return revealed;
}

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="ml-[1px] inline-block h-[1em] w-[2px] translate-y-[3px] bg-ink/80 align-baseline animate-blink"
    />
  );
}

function AboutBody() {
  const about = useSiteContent().about;
  const sections: Section[] = useMemo(
    () => [
      ...about.paragraphs.map((text) => ({ kind: "p" as const, text })),
      { kind: "quote" as const, text: about.quote },
      { kind: "sig" as const, text: about.signature },
    ],
    [about.paragraphs, about.quote, about.signature]
  );

  const withOffsets = useMemo(() => {
    let offset = 0;
    return sections.map((s) => {
      const start = offset;
      offset += s.text.length;
      return { ...s, start, end: offset };
    });
  }, [sections]);

  const totalChars = withOffsets[withOffsets.length - 1].end;
  const revealed = useTypewriter(totalChars, 5, 16); // ~300 cps → ~4s

  return (
    <div className="max-w-[560px] space-y-5 text-[14px] leading-relaxed text-ink/90">
      {withOffsets.map((sec, i) => {
        if (revealed <= sec.start) return null;
        const visible = Math.min(revealed - sec.start, sec.text.length);
        const text = sec.text.slice(0, visible);
        const isActive = revealed < sec.end;

        if (sec.kind === "p") {
          return (
            <p key={i}>
              {text}
              {isActive && <Cursor />}
            </p>
          );
        }
        if (sec.kind === "quote") {
          return (
            <blockquote
              key={i}
              className="mt-4 pl-4 pr-2 text-center text-[13px] italic text-ink/70 sm:pl-6"
            >
              {text}
              {isActive && <Cursor />}
            </blockquote>
          );
        }
        return (
          <p key={i} className="text-right font-script text-[22px] text-ink/80">
            {text}
            {isActive && <Cursor />}
          </p>
        );
      })}
    </div>
  );
}

/* ------------------------ Timeline ------------------------ */

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative ml-12 border-l border-border pl-6 sm:ml-14">
      {entries.map((e, i) => (
        <li
          key={e.id}
          className="relative mb-6 last:mb-0 animate-fade-up"
          style={{ animationDelay: `${i * 110}ms` }}
        >
          <span
            className={`absolute -left-[29px] top-2 h-2.5 w-2.5 rounded-full ${
              e.is_current ? "bg-emerald-500" : "bg-border"
            }`}
          />
          <div className="absolute -left-[76px] top-1 w-12 text-right text-[12px] leading-tight text-muted sm:-left-[80px]">
            {e.year}
            {e.is_current && <div className="text-[10px]">&amp; present</div>}
          </div>
          <div className="text-[14px] font-semibold text-ink">{e.title}</div>
          <div className="text-[12px] text-muted">{e.company}</div>
        </li>
      ))}
    </ol>
  );
}

/* ------------------------ Side panel + icons ------------------------ */

function SidePanel() {
  const content = useSiteContent();
  const site = content.site;
  const about = content.about;
  return (
    <aside className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-1">
      <Card label="LOCATION" icon={<PinIcon />}>
        <a
          href={site.maps_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${site.location_city}, ${site.location_country} in Google Maps`}
          className="inline-flex items-center gap-1 text-[14px] font-semibold text-ink underline decoration-ink/25 decoration-1 underline-offset-4 transition-colors hover:decoration-ink"
        >
          {site.location_city}
          <ExternalLinkIcon />
        </a>
        <div className="text-[12px] text-muted">{site.location_country}</div>
      </Card>

      <Card label="TOOLS & TECH" icon={<ToolsIcon />}>
        <p className="text-[13px] leading-[1.5] text-ink">
          {about.side_tools_text}
        </p>
      </Card>

      <Card label="CONTACT" icon={<MailIcon />}>
        <div className="flex items-center gap-2">
          <ContactLink
            href={about.side_contact_email ? `mailto:${about.side_contact_email}` : "#"}
            label="Email"
          >
            <MailIcon />
          </ContactLink>
          <ContactLink
            href={about.side_contact_telegram_url || "#"}
            label="Telegram"
          >
            <TelegramIcon />
          </ContactLink>
        </div>
      </Card>
    </aside>
  );
}

function Card({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-surface to-bg p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-[0_14px_30px_-14px_rgba(0,0,0,0.22)]">
      {/* soft accent glow in top-right corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/15 blur-2xl opacity-70 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative mb-3 flex items-center gap-2">
        <div className="grid h-7 w-7 place-items-center rounded-lg border border-border bg-bg text-ink/70 shadow-soft transition-colors group-hover:text-ink">
          {icon}
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          {label}
        </div>
      </div>
      <div className="relative text-[13px] leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}

function ContactLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      title={label}
      className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-bg text-ink transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      {children}
    </a>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      className="opacity-60"
      aria-hidden="true"
    >
      <path
        d="M14 4h6v6M20 4L10 14M9 5H5a1 1 0 00-1 1v13a1 1 0 001 1h13a1 1 0 001-1v-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14.7 6.3a4 4 0 015.1 5.1l-8.9 8.9-5.1 1 1-5.1 8.9-8.9z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M13 8l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M4 7l8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21.5 3.5L2.5 11l6 2.2 2.2 6.3L21.5 3.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 13.2l3.5 3.5 9.5-13.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
