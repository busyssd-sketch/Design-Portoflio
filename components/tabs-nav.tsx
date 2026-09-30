"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "DESIGNS", icon: GridIcon },
  { href: "/videos", label: "VIDEOS", icon: VideoIcon },
  { href: "/appreciations", label: "APPRECIATIONS", icon: PenIcon },
  { href: "/about", label: "ABOUT ME", icon: PersonIcon },
];

export function TabsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className="mt-6 border-t border-border pt-4"
    >
      <ul className="no-scrollbar flex snap-x snap-mandatory items-stretch overflow-x-auto sm:grid sm:grid-cols-4">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li
              key={href}
              className="flex flex-1 shrink-0 basis-1/2 snap-start justify-center sm:basis-auto"
            >
              <Link
                href={href}
                className={`relative flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[12px] tracking-wider transition-colors sm:text-[13px] ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon />
                <span className={active ? "font-semibold" : ""}>{label}</span>
                {active && (
                  <span className="absolute -top-4 left-1/2 h-[2px] w-16 -translate-x-1/2 bg-ink" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M17 10l4-2v8l-4-2z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20l4-1 11-11-3-3L5 16l-1 4z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 21c1-4 4-6 8-6s7 2 8 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
