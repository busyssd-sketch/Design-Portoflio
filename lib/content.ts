"use client";

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
 * Central client-side content hook. Every editable field on the site reads
 * from here. It returns the *published* CMS snapshot (localStorage-backed
 * today; Supabase-backed once wired) and falls back to the seed content
 * when nothing is stored yet.
 */
export function useSiteContent(): SiteContent {
  const snap = usePublished();
  return snap?.data ?? defaultSiteContent();
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
