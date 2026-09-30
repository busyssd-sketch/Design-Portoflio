"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar } from "./avatar";
import { useSiteContent } from "@/lib/content";

export function ProfileHeader() {
  const p = useSiteContent().profile;

  return (
    <section className="flex flex-col items-center gap-6 py-4 text-center sm:flex-row sm:items-start sm:gap-8 sm:py-6 sm:text-left">
      <Avatar />
      <div className="flex flex-col gap-2 sm:pt-1">
        <h1 className="text-[22px] font-semibold tracking-tight text-ink sm:text-[26px]">
          {p.full_name}
        </h1>
        <p className="text-[14px] text-muted">{p.tagline}</p>
        <p className="max-w-[560px] text-[14px] leading-relaxed text-ink/90 sm:text-[15px]">
          {p.bio}
        </p>
        <p className="font-kalam text-[15px] text-ink/85 sm:text-[16px]">
          <span className="font-bold">{p.experience_line_bold}</span>
          <span>{p.experience_line_rest}</span>
        </p>
        <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
          <SocialButton
            href={p.socials.instagram_url || "#"}
            label="Instagram"
            variant="instagram"
          />
          <SocialButton
            href={p.socials.linkedin_url || "#"}
            label="LinkedIn"
            variant="linkedin"
          />
          <SocialButton
            href={p.socials.email ? `mailto:${p.socials.email}` : "#"}
            label="Email"
            variant="email"
          />
        </div>
      </div>
    </section>
  );
}

function SocialButton({
  href,
  label,
  variant,
}: {
  href: string;
  label: string;
  variant: "instagram" | "linkedin" | "email";
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface transition-colors hover:bg-bg"
    >
      {variant === "instagram" && <InstagramGlyph />}
      {variant === "linkedin" && <LinkedInGlyph />}
      {variant === "email" && <EmailGlyph />}
    </Link>
  );
}

function InstagramGlyph() {
  return (
    <Image
      src="/icons/instagram.png"
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
    />
  );
}

function LinkedInGlyph() {
  return (
    <Image
      src="/icons/linkedin.png"
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 object-contain"
    />
  );
}

function EmailGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-ink"
      aria-hidden="true"
    >
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
