"use client";

import Image from "next/image";
import { useSiteContent } from "@/lib/content";
import { Footer } from "./footer";

export function RenovationPage() {
  const content = useSiteContent();
  const site = content.site;
  const profile = content.profile;
  const about = content.about;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <main className="flex flex-1 flex-col items-center px-5 pb-10 pt-14 sm:pt-16">
        <div className="flex w-full max-w-[600px] flex-col items-center gap-10">
          {/* Avatar with double bezel — mirrors the profile mark on the main site */}
          <div className="flex flex-col items-center gap-4">
            <div className="grid h-[120px] w-[120px] place-items-center rounded-full border border-border p-1">
              <div className="grid h-full w-full place-items-center rounded-full border border-border/70 p-[3px]">
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.avatar_default_url || "/avatar.png"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <h1 className="text-[28px] font-semibold text-ink">
                {profile.full_name}
              </h1>
              <p className="text-[14px] uppercase tracking-[1px] text-muted">
                {profile.tagline}
              </p>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative aspect-square w-[280px] sm:w-[356px]">
            <Image
              src="/renovation-illustration.png?v=3"
              alt="Illustrated Sandeep tinkering with a circuit board"
              fill
              priority
              sizes="(min-width: 640px) 356px, 280px"
              className="object-contain"
            />
          </div>

          {/* Message */}
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-[22px] font-bold leading-[1.35] text-ink sm:text-[24px] sm:leading-[32px]">
              {site.renovation_heading}
            </h2>
            <p className="max-w-[560px] text-[14px] leading-[1.55] text-muted">
              {site.renovation_body}
            </p>
          </div>

          {/* Contact pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <ContactPill
              href={
                about.side_contact_email
                  ? `mailto:${about.side_contact_email}`
                  : profile.socials.email
                    ? `mailto:${profile.socials.email}`
                    : "#"
              }
              label="Email"
              icon={<MailIcon />}
            />
            <ContactPill
              href={about.side_contact_telegram_url || "#"}
              label="Telegram"
              icon={<TelegramIcon />}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ContactPill({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-2.5 text-[13px] font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
    >
      <span className="grid h-[18px] w-[18px] place-items-center text-ink">
        {icon}
      </span>
      {label}
    </a>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
