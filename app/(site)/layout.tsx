import { SiteContentProvider } from "@/lib/content";
import { getPublishedSnapshotServer } from "@/lib/server-content";
import { SiteShell } from "@/components/site-shell";

// Always fetch published content at request time — no static caching, no
// stale HTML from an earlier deploy. Publishing in /cms shows up on the
// next page load.
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const snap = await getPublishedSnapshotServer();
  return (
    <SiteContentProvider value={snap.data}>
      <SiteShell>{children}</SiteShell>
    </SiteContentProvider>
  );
}
