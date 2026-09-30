"use client";

import { useSiteContent } from "@/lib/content";

/**
 * Two-sided flip card that auto-rotates on its X-axis.
 * Both faces come from the CMS profile.avatar_* fields, so they can be an
 * arbitrary URL, a base64 data URI, or a public-folder path.
 */
export function Avatar() {
  const p = useSiteContent().profile;
  return (
    <div className="avatar-scene shrink-0">
      <div className="avatar-inner">
        <div className="avatar-face avatar-front">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.avatar_default_url || "/avatar.png"}
            alt="Profile mark"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="avatar-face avatar-back">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.avatar_portrait_url || "/avatar-portrait.png"}
            alt="Portrait"
            className="h-full w-full object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
