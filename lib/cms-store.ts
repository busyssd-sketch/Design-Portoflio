"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { getBrowserSupabase, isSupabaseConfigured } from "./supabase";
import { defaultSiteContent } from "./fallback-content";
import type { SiteContent, Snapshot } from "./types";

/* ============================================================================
 * cms-store — Supabase-backed content store
 *
 * The public API stays synchronous so consumer components don't change:
 *   - useDraft(), usePublished(), useCmsStatus() — sync hooks
 *   - saveDraft(), publishDraft(), resetDraftToPublished() — imperative
 *
 * Under the hood we keep an in-memory cache and hydrate it from Supabase on
 * first render. Writes are optimistic — the memory cache updates immediately
 * and the Supabase upsert runs in the background.
 * ============================================================================ */

const DRAFT_KIND = "draft";
const PUBLISHED_KIND = "published";
const EVENT_NAME = "cms:changed";

/** Merge defaults into stored data so newly-added fields appear on old rows. */
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

/* ---------- In-memory cache (client only) ---------- */

const memory: Record<string, Snapshot> = {
  [DRAFT_KIND]: seedSnapshot(),
  [PUBLISHED_KIND]: seedSnapshot(),
};

const hydrated: Record<string, boolean> = {
  [DRAFT_KIND]: false,
  [PUBLISHED_KIND]: false,
};

function seedSnapshot(): Snapshot {
  return Object.freeze({
    data: defaultSiteContent(),
    updated_at: new Date(0).toISOString(),
  }) as Snapshot;
}

function fire() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function readMemory(kind: string): Snapshot {
  return memory[kind] ?? seedSnapshot();
}

function writeMemory(kind: string, snap: Snapshot) {
  memory[kind] = snap;
  fire();
}

/* ---------- Supabase I/O ---------- */

async function fetchKind(kind: string): Promise<Snapshot | null> {
  const supabase = getBrowserSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("site_content")
    .select("data, updated_at")
    .eq("kind", kind)
    .maybeSingle();
  if (error || !data) return null;
  return { data: migrate(data.data as SiteContent), updated_at: data.updated_at };
}

async function upsertKind(kind: string, snap: Snapshot) {
  const supabase = getBrowserSupabase();
  if (!supabase) return;
  await supabase.from("site_content").upsert(
    {
      kind,
      data: snap.data,
      updated_at: snap.updated_at,
    },
    { onConflict: "kind" },
  );
}

async function hydrate(kind: string) {
  if (hydrated[kind]) return;
  hydrated[kind] = true;
  const snap = await fetchKind(kind);
  if (snap) {
    writeMemory(kind, snap);
  }
}

/* ---------- Imperative API ---------- */

export function getDraft(): Snapshot {
  if (typeof window !== "undefined") void hydrate(DRAFT_KIND);
  return readMemory(DRAFT_KIND);
}

export function getPublished(): Snapshot {
  if (typeof window !== "undefined") void hydrate(PUBLISHED_KIND);
  return readMemory(PUBLISHED_KIND);
}

export function saveDraft(data: SiteContent) {
  const snap: Snapshot = { data, updated_at: new Date().toISOString() };
  writeMemory(DRAFT_KIND, snap);
  void upsertKind(DRAFT_KIND, snap);
}

export function publishDraft(): Snapshot {
  const draft = readMemory(DRAFT_KIND);
  const snap: Snapshot = {
    data: draft.data,
    updated_at: new Date().toISOString(),
  };
  writeMemory(PUBLISHED_KIND, snap);
  void upsertKind(PUBLISHED_KIND, snap);
  return snap;
}

export function resetDraftToPublished() {
  const pub = readMemory(PUBLISHED_KIND);
  const snap: Snapshot = {
    data: pub.data,
    updated_at: new Date().toISOString(),
  };
  writeMemory(DRAFT_KIND, snap);
  void upsertKind(DRAFT_KIND, snap);
}

/* ---------- React helpers ---------- */

function subscribe(callback: () => void) {
  const handler = () => callback();
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

function getServerSnapshot(): Snapshot {
  return seedSnapshot();
}

function useKindSnapshot(kind: string): Snapshot {
  const value = useSyncExternalStore(
    subscribe,
    () => readMemory(kind),
    getServerSnapshot,
  );
  useEffect(() => {
    void hydrate(kind);
  }, [kind]);
  return value;
}

export function useDraft(): [
  SiteContent,
  (updater: (d: SiteContent) => SiteContent) => void,
  Snapshot,
] {
  const draft = useKindSnapshot(DRAFT_KIND);
  const setDraft = useCallback((updater: (d: SiteContent) => SiteContent) => {
    const current = readMemory(DRAFT_KIND).data;
    saveDraft(updater(current));
  }, []);
  return [draft.data, setDraft, draft];
}

export function usePublished(): Snapshot {
  return useKindSnapshot(PUBLISHED_KIND);
}

export function useCmsStatus() {
  const draft = useKindSnapshot(DRAFT_KIND);
  const published = useKindSnapshot(PUBLISHED_KIND);
  const isUnpublished =
    JSON.stringify(draft.data) !== JSON.stringify(published.data);
  return {
    draftUpdatedAt: draft.updated_at,
    publishedUpdatedAt: published.updated_at,
    isUnpublished,
    isBackendConfigured: isSupabaseConfigured(),
  };
}
