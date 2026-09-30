import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { createClient as createRawClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(URL && ANON);
}

/* ---------- Browser (client components) ---------- */

let browserCache: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient | null {
  if (browserCache) return browserCache;
  if (!URL || !ANON) return null;
  browserCache = createBrowserClient(URL, ANON);
  return browserCache;
}

/* ---------- Server (RSC + middleware) ----------
 *
 * Server client resolves cookies at call time so auth state stays in sync.
 * `cookies` accepts the Next.js `cookies()` return value.
 */

type CookieAdapter = {
  get(name: string): string | undefined;
  set?(name: string, value: string, options?: CookieOptions): void;
  remove?(name: string, options?: CookieOptions): void;
};

export function getServerSupabase(cookies: CookieAdapter): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createServerClient(URL, ANON, {
    cookies: {
      get: (name: string) => cookies.get(name),
      set: (name: string, value: string, options: CookieOptions) =>
        cookies.set?.(name, value, options),
      remove: (name: string, options: CookieOptions) =>
        cookies.remove?.(name, options),
    },
  });
}

/* ---------- Anonymous read-only client (no cookies) ---------- *
 *
 * For server-side "just fetch the published snapshot" reads on public pages.
 * Doesn't touch cookies, doesn't persist auth.
 */

export function getAnonSupabase(): SupabaseClient | null {
  if (!URL || !ANON) return null;
  return createRawClient(URL, ANON, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
