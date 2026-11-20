"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { isCmsBackendConfigured } from "./cms-api";
import { defaultSiteContent } from "./fallback-content";
import type { SiteContent, Snapshot } from "./types";

const DRAFT_KIND = "draft";
const PUBLISHED_KIND = "published";
const EVENT_NAME = "cms:changed";

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
function seedSnapshot(): Snapshot {
  return { data: defaultSiteContent(), updated_at: new Date(0).toISOString() };
}
const memory: Record<string, Snapshot> = { draft: seedSnapshot(), published: seedSnapshot() };
const hydrated: Record<string, boolean> = { draft: false, published: false };
function fire() { if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT_NAME)); }
function readMemory(kind: string) { return memory[kind] ?? seedSnapshot(); }
function writeMemory(kind: string, snap: Snapshot) { memory[kind] = snap; fire(); }

async function fetchKind(kind: string): Promise<Snapshot | null> {
  try {
    const response = await fetch(`/api/cms/content/${kind}`, { cache: "no-store" });
    if (!response.ok) return null;
    const result = await response.json() as Snapshot;
    return { data: migrate(result.data), updated_at: result.updated_at };
  } catch { return null; }
}
async function upsertKind(kind: string, snap: Snapshot) {
  const response = await fetch(`/api/cms/content/${kind}`, {
    method: "PUT", headers: { "content-type": "application/json" },
    body: JSON.stringify(snap),
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { error?: string };
    console.error(`CMS ${kind} save failed:`, result.error || response.statusText);
  }
}
async function hydrate(kind: string) {
  if (hydrated[kind]) return;
  hydrated[kind] = true;
  const snap = await fetchKind(kind);
  if (snap) writeMemory(kind, snap);
}
export function getDraft(): Snapshot { if (typeof window !== "undefined") void hydrate(DRAFT_KIND); return readMemory(DRAFT_KIND); }
export function getPublished(): Snapshot { if (typeof window !== "undefined") void hydrate(PUBLISHED_KIND); return readMemory(PUBLISHED_KIND); }
export function saveDraft(data: SiteContent) {
  const snap = { data, updated_at: new Date().toISOString() };
  writeMemory(DRAFT_KIND, snap);
  void upsertKind(DRAFT_KIND, snap);
}
export function publishDraft(): Snapshot {
  const draft = readMemory(DRAFT_KIND);
  const snap = { data: draft.data, updated_at: new Date().toISOString() };
  writeMemory(PUBLISHED_KIND, snap);
  void upsertKind(PUBLISHED_KIND, snap);
  return snap;
}
export function resetDraftToPublished() {
  const pub = readMemory(PUBLISHED_KIND);
  const snap = { data: pub.data, updated_at: new Date().toISOString() };
  writeMemory(DRAFT_KIND, snap);
  void upsertKind(DRAFT_KIND, snap);
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT_NAME, callback);
  return () => window.removeEventListener(EVENT_NAME, callback);
}
function getServerSnapshot() { return seedSnapshot(); }
function useKindSnapshot(kind: string): Snapshot {
  const value = useSyncExternalStore(subscribe, () => readMemory(kind), getServerSnapshot);
  useEffect(() => { void hydrate(kind); }, [kind]);
  return value;
}
export function useDraft(): [SiteContent, (updater: (d: SiteContent) => SiteContent) => void, Snapshot] {
  const draft = useKindSnapshot(DRAFT_KIND);
  const setDraft = useCallback((updater: (d: SiteContent) => SiteContent) => saveDraft(updater(readMemory(DRAFT_KIND).data)), []);
  return [draft.data, setDraft, draft];
}
export function usePublished(): Snapshot { return useKindSnapshot(PUBLISHED_KIND); }
export function useCmsStatus() {
  const draft = useKindSnapshot(DRAFT_KIND);
  const published = useKindSnapshot(PUBLISHED_KIND);
  return {
    draftUpdatedAt: draft.updated_at,
    publishedUpdatedAt: published.updated_at,
    isUnpublished: JSON.stringify(draft.data) !== JSON.stringify(published.data),
    isBackendConfigured: isCmsBackendConfigured(),
  };
}
