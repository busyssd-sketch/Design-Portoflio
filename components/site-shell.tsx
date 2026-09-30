"use client";

import { TopNav } from "@/components/top-nav";
import { ProfileHeader } from "@/components/profile-header";
import { TabsNav } from "@/components/tabs-nav";
import { Footer } from "@/components/footer";
import { SiteMetadata } from "@/components/site-metadata";
import { RenovationPage } from "@/components/renovation-page";
import { useSiteContent } from "@/lib/content";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const site = useSiteContent().site;

  if (site.renovation_mode) {
    return (
      <>
        <SiteMetadata />
        <RenovationPage />
      </>
    );
  }

  return (
    <>
      <SiteMetadata />
      <TopNav />
      <main className="mx-auto w-full max-w-[960px] px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-16">
        <ProfileHeader />
        <TabsNav />
        <div className="animate-fade-up">{children}</div>
      </main>
      <Footer />
    </>
  );
}
