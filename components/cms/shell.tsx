"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useCmsStatus,
  publishDraft,
  resetDraftToPublished,
  usePublished,
} from "@/lib/cms-store";
import { getBrowserSupabase } from "@/lib/supabase";

const SECTIONS = [
  { href: "/cms", label: "Overview" },
  { href: "/cms/site", label: "Site & Nav" },
  { href: "/cms/profile", label: "Profile Header" },
  { href: "/cms/designs", label: "Designs" },
  { href: "/cms/videos", label: "Videos" },
  { href: "/cms/appreciations", label: "Appreciations" },
  { href: "/cms/about", label: "About" },
  { href: "/cms/timeline", label: "Timeline" },
  { href: "/cms/footer", label: "Footer" },
];

function relTime(iso: string) {
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d) || d < 1000) return "never";
  const diff = Date.now() - d;
  if (diff < 60_000) return "just now";
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export function CmsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { draftUpdatedAt, publishedUpdatedAt, isUnpublished } = useCmsStatus();
  const published = usePublished();

  // Login page renders bare, without the shell chrome.
  if (pathname === "/cms/login") {
    return <>{children}</>;
  }

  const renovationLive = published.data.site.renovation_mode;

  const handleSignOut = async () => {
    const supabase = getBrowserSupabase();
    if (supabase) await supabase.auth.signOut();
    router.replace("/cms/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Link
              href="/cms"
              className="text-[14px] font-semibold tracking-tight"
            >
              Portfolio CMS
            </Link>
            {renovationLive && (
              <Link
                href="/cms/site"
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900 transition-colors hover:bg-amber-200"
                title="Public site is currently showing the renovation page"
              >
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                Renovation on
              </Link>
            )}
            <span className="hidden text-[11px] text-slate-500 sm:inline">
              draft&nbsp;•&nbsp;{relTime(draftUpdatedAt)}
              &nbsp;·&nbsp;published&nbsp;•&nbsp;{relTime(publishedUpdatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm(
                    "Discard unsaved changes and revert to the last published version?",
                  )
                ) {
                  resetDraftToPublished();
                }
              }}
              disabled={!isUnpublished}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-40"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={() => {
                publishDraft();
              }}
              disabled={!isUnpublished}
              className={`rounded-md px-3 py-1.5 text-[13px] font-semibold text-white transition-colors ${
                isUnpublished
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-300"
              }`}
            >
              {isUnpublished ? "Save & Publish" : "Published"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] gap-8 px-4 py-8">
        <aside className="w-52 shrink-0">
          <nav className="sticky top-20 flex flex-col gap-0.5">
            {SECTIONS.map((s) => {
              const active =
                s.href === "/cms"
                  ? pathname === "/cms"
                  : pathname?.startsWith(s.href);
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  className={`rounded-md px-3 py-1.5 text-[13px] transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            {children}
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            Draft changes are saved automatically as you type. Nothing goes live
            until you click <strong>Save &amp; Publish</strong>.
          </p>
        </main>
      </div>
    </div>
  );
}
