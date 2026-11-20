import { NextResponse } from "next/server";
import { getPublishedSnapshotServer } from "@/lib/server-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const snapshot = await getPublishedSnapshotServer();
  return NextResponse.json({
    build: "cloudflare-cms-v1",
    backendConfigured: Boolean(process.env.CLOUDFLARE_CMS_API_URL),
    hasPublishedContent: snapshot.updated_at !== new Date(0).toISOString(),
    updated_at: snapshot.updated_at,
    renovation_mode: snapshot.data.site.renovation_mode,
    tagline: snapshot.data.profile.tagline,
  });
}
