"use client";

import Link from "next/link";

const CARDS: Array<{
  href: string;
  title: string;
  desc: string;
}> = [
  {
    href: "/cms/site",
    title: "Site & Nav",
    desc: "SEO title, live clock/weather widget, location coordinates.",
  },
  {
    href: "/cms/profile",
    title: "Profile Header",
    desc: "Name, tagline, bio, avatar images, social links, experience line.",
  },
  {
    href: "/cms/designs",
    title: "Designs",
    desc: "3×3 gallery cards. Titles, descriptions, images.",
  },
  {
    href: "/cms/videos",
    title: "Videos",
    desc: "2×3 video cards. Thumbnails, titles, descriptions, video URLs.",
  },
  {
    href: "/cms/appreciations",
    title: "Appreciations",
    desc: "Testimonial quotes with author + role.",
  },
  {
    href: "/cms/about",
    title: "About",
    desc: "Typewriter paragraphs, quote, signature, side-panel contents.",
  },
  {
    href: "/cms/timeline",
    title: "Timeline",
    desc: "Career entries — year, role, company, current flag.",
  },
  {
    href: "/cms/footer",
    title: "Footer",
    desc: "Language label + copyright text.",
  },
];

export default function CmsIndexPage() {
  return (
    <div>
      <h1 className="text-[22px] font-semibold text-slate-900">
        Welcome back.
      </h1>
      <p className="mt-1 text-[14px] text-slate-600">
        Every editable area of the portfolio is grouped below. Changes save to
        a draft as you type; nothing is public until you hit{" "}
        <strong>Save &amp; Publish</strong> in the top-right.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-sm"
          >
            <div className="text-[14px] font-semibold text-slate-900">
              {c.title}
            </div>
            <div className="text-[12px] text-slate-600">{c.desc}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-[12px] text-amber-900">
        <strong>Interim storage:</strong> the CMS currently persists to your
        browser (localStorage) only. Once we wire Supabase, a Save &amp;
        Publish will push to the shared database automatically — same UI, no
        re-work.
      </div>
    </div>
  );
}
