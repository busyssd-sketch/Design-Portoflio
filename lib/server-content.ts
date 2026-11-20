import "server-only";
import { defaultSiteContent } from "./fallback-content";
import type { SiteContent, Snapshot } from "./types";

function migrate(data: SiteContent): SiteContent {
  const defaults = defaultSiteContent();
  return {
    ...defaults, ...data,
    site: { ...defaults.site, ...(data.site ?? {}) },
    profile: { ...defaults.profile, ...(data.profile ?? {}), socials: { ...defaults.profile.socials, ...(data.profile?.socials ?? {}) } },
    about: { ...defaults.about, ...(data.about ?? {}) },
    footer: { ...defaults.footer, ...(data.footer ?? {}) },
    designs: data.designs ?? defaults.designs,
    videos: data.videos ?? defaults.videos,
    appreciations: data.appreciations ?? defaults.appreciations,
    timeline: data.timeline ?? defaults.timeline,
  };
}
export async function getPublishedSnapshotServer(): Promise<Snapshot> {
  const fallback: Snapshot = { data: defaultSiteContent(), updated_at: new Date(0).toISOString() };
  const base = process.env.CLOUDFLARE_CMS_API_URL?.replace(/\/$/, "");
  if (!base) return fallback;
  try {
    const response = await fetch(`${base}/content/published`, { cache: "no-store" });
    if (!response.ok) return fallback;
    const result = await response.json() as Snapshot;
    return { data: migrate(result.data), updated_at: result.updated_at };
  } catch { return fallback; }
}
