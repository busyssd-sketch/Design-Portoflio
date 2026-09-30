"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePublished } from "./cms-store";
import { defaultSiteContent } from "./fallback-content";
import type {
  Appreciation,
  DesignItem,
  SiteContent,
  TimelineEntry,
  VideoItem,
} from "./types";

/**
 * Public-site content is provided via context. The (site) layout is a server
 * component that fetches the published snapshot at request time and passes it
 * into <SiteContentProvider>, so every child sees fresh, published data —
 * no client-side hydration flash, no CDN staleness.
 *
 * CMS pages don't use this provider; they still read live draft/published
 * state through the cms-store hooks directly.
 */
const SiteContentContext = createContext<SiteContent | null>(null);

export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteContent;
  children: ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

/**
 * Read the site content. Prefers the SSR-provided context value; falls back
 * to the client cms-store for pages/components that render outside a provider.
 */
export function useSiteContent(): SiteContent {
  const ctx = useContext(SiteContentContext);
  const store = usePublished();
  return ctx ?? store?.data ?? defaultSiteContent();
}

export function useDesigns(): DesignItem[] {
  return useSiteContent().designs;
}

export function useVideos(): VideoItem[] {
  return useSiteContent().videos;
}

export function useAppreciations(): Appreciation[] {
  return useSiteContent().appreciations;
}

export function useTimeline(): TimelineEntry[] {
  return useSiteContent().timeline;
}
