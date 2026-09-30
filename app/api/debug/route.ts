import { NextResponse } from "next/server";
import { getAnonSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const build = "ssr-v2";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || null;
  const anonSet = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const supabase = getAnonSupabase();
  if (!supabase) {
    return NextResponse.json({
      build,
      env: { url, anonSet },
      fetch: "supabase client is null (env missing)",
    });
  }

  const { data, error } = await supabase
    .from("site_content")
    .select("kind, updated_at, data")
    .eq("kind", "published")
    .maybeSingle();

  return NextResponse.json({
    build,
    env: { url, anonSet },
    fetch: {
      error: error?.message ?? null,
      hasRow: Boolean(data),
      updated_at: data?.updated_at ?? null,
      renovation_mode: data?.data?.site?.renovation_mode ?? null,
      tagline: data?.data?.profile?.tagline ?? null,
    },
  });
}
