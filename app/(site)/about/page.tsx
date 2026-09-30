"use client";

import { useTimeline } from "@/lib/content";
import { AboutSwitcher } from "@/components/about-switcher";
import Image from "next/image";

export default function AboutPage() {
  const timeline = useTimeline();
  return (
    <section className="pt-8">
      <div className="relative aspect-[16/5] w-full overflow-hidden rounded-2xl border border-border bg-surface">
        <Image
          src="/about-banner.png"
          alt="Illustrated collage of Sandeep sketching, filming, editing, and prototyping"
          fill
          sizes="(min-width: 960px) 900px, 100vw"
          priority
          className="object-cover"
        />
      </div>
      <AboutSwitcher timeline={timeline} />
    </section>
  );
}
