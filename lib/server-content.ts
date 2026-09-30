import "server-only";
import { getAnonSupabase } from "./supabase";
import { defaultSiteContent } from "./fallback-content";
import type { SiteContent, Snapshot } from "./types";

/**
 * Server-only fetcher for the published CMS snapshot. Called from server
 * components in the /(site) route group so visitors get the latest content
 * at request time — no client-side hydration flash, no need to redeploy.
 */
export async function getPublishedSnapshotServer(): Promise<Snapshot> {
  const supabase = getAnonSupabase();
  const fallback: Snapshot = {
    data: defaultSiteContent(),
    updated_at: new Date(0).toISOString(),
  };
  if (!supabase) return fallback;
  try {
    const { data, error } = await supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("kind", "published")
      .maybeSingle();
    if (error || !data) return fallback;
    return {
      data: migrate(data.data as SiteContent),
      updated_at: data.updated_at,
    };
  } catch {
    return fallback;
  }
}

// Same shape as cms-store.migrate — kept local so this file has no client deps.
function migrate(data: SiteContent): SiteContent {
  const defaults = defaultSiteContent();
  return {
    ...defaults,
    ...data,
    site: { ...defaults.site, ...(data.site ?? {}) },
    profile: {
      ...defaults.profile,
      ...(data.profile ?? {}),
      socials: {
        ...defaults.profile.socials,
        ...(data.profile?.socials ?? {}),
      },
    },
    about: { ...defaults.about, ...(data.about ?? {}) },
    footer: { ...defaults.footer, ...(data.footer ?? {}) },
    designs: data.designs ?? defaults.designs,
    videos: data.videos ?? defaults.videos,
    appreciations: data.appreciations ?? defaults.appreciations,
    timeline: data.timeline ?? defaults.timeline,
  };
}
