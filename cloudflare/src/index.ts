interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  CMS_ADMIN_EMAIL: string;
  CMS_ADMIN_PASSWORD: string;
  CMS_SESSION_SECRET: string;
  MEDIA_PUBLIC_BASE_URL: string;
  CMS_ORIGIN: string;
}

const SESSION_SECONDS = 60 * 60 * 24 * 7;
const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
  "video/mp4", "video/webm", "video/quicktime",
]);

function json(data: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}
function b64url(bytes: ArrayBuffer | Uint8Array) {
  const array = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  array.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function decodeB64url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
}
async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}
async function createToken(env: Env) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = b64url(new TextEncoder().encode(JSON.stringify({ sub: env.CMS_ADMIN_EMAIL, iat: now, exp: now + SESSION_SECONDS })));
  const input = `${head}.${body}`;
  return `${input}.${await sign(input, env.CMS_SESSION_SECRET)}`;
}
async function verifyToken(token: string, secret: string) {
  try {
    const [head, body, signature] = token.split(".");
    if (!head || !body || !signature) return false;
    const input = `${head}.${body}`;
    if ((await sign(input, secret)) !== signature) return false;
    const payload = JSON.parse(new TextDecoder().decode(decodeB64url(body))) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Math.floor(Date.now() / 1000);
  } catch { return false; }
}
async function authorized(request: Request, env: Env) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return Boolean(token && await verifyToken(token, env.CMS_SESSION_SECRET));
}
function safeFileName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "upload";
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const requestOrigin = request.headers.get("origin") || "";
    const allowedOrigins = (env.CMS_ORIGIN || "").split(",").map((value) => value.trim()).filter(Boolean);
    const corsHeaders = {
      "access-control-allow-origin": allowedOrigins.includes(requestOrigin) ? requestOrigin : (allowedOrigins[0] || "null"),
      "access-control-allow-methods": "PUT, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "vary": "Origin",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

    if (path === "/health" && request.method === "GET") return json({ ok: true, service: "portfolio-cms-api" });

    if (path === "/auth/login" && request.method === "POST") {
      const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
      if (!body || body.email !== env.CMS_ADMIN_EMAIL || body.password !== env.CMS_ADMIN_PASSWORD) {
        return json({ error: "Invalid email or password." }, 401);
      }
      return json({ token: await createToken(env), expiresIn: SESSION_SECONDS });
    }

    // Public media delivery. Configure the R2 bucket binding; do not expose write access.
    if (path.startsWith("/media/") && request.method === "GET") {
      const key = decodeURIComponent(path.slice("/media/".length));
      const object = await env.MEDIA.get(key);
      if (!object) return new Response("Not found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=31536000, immutable");
      headers.set("x-content-type-options", "nosniff");
      return new Response(object.body, { headers });
    }

    if (path.startsWith("/content/") && request.method === "GET") {
      const kind = path.slice("/content/".length);
      if (kind !== "published" && kind !== "draft") return json({ error: "Unknown content type." }, 404);
      if (kind === "draft" && !(await authorized(request, env))) return json({ error: "Unauthorized." }, 401);
      const row = await env.DB.prepare("SELECT data, updated_at FROM site_content WHERE kind = ?").bind(kind).first<{ data: string; updated_at: string }>();
      return row ? json({ data: JSON.parse(row.data), updated_at: row.updated_at }) : json({ error: "Content not initialized." }, 404);
    }

    if (path.startsWith("/content/") && request.method === "PUT") {
      if (!(await authorized(request, env))) return json({ error: "Unauthorized." }, 401);
      const kind = path.slice("/content/".length);
      if (kind !== "draft" && kind !== "published") return json({ error: "Unknown content type." }, 404);
      const body = await request.json().catch(() => null) as { data?: unknown; updated_at?: string } | null;
      if (!body || typeof body.data !== "object" || body.data === null) return json({ error: "Invalid content payload." }, 400);
      const updatedAt = body.updated_at || new Date().toISOString();
      await env.DB.prepare("INSERT INTO site_content (kind, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(kind) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
        .bind(kind, JSON.stringify(body.data), updatedAt).run();
      return json({ ok: true, updated_at: updatedAt });
    }

    if (path === "/media/upload-ticket" && request.method === "POST") {
      if (!(await authorized(request, env))) return json({ error: "Unauthorized." }, 401);
      const body = await request.json().catch(() => null) as { fileName?: string; contentType?: string; size?: number } | null;
      if (!body || !body.fileName || !body.contentType || !ALLOWED_TYPES.has(body.contentType)) return json({ error: "Invalid upload details or unsupported file type." }, 400);
      if (!Number.isFinite(body.size) || Number(body.size) <= 0 || Number(body.size) > MAX_UPLOAD_BYTES) return json({ error: "Maximum upload size is 100 MB." }, 413);
      const safeName = safeFileName(decodeURIComponent(body.fileName));
      const folder = body.contentType.startsWith("image/") ? (body.contentType === "image/gif" ? "gifs" : "images") : "videos";
      const key = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const ticketPayload = b64url(new TextEncoder().encode(JSON.stringify({ key, contentType: body.contentType, size: Number(body.size), exp: Math.floor(Date.now() / 1000) + 600 })));
      const ticket = `${ticketPayload}.${await sign(ticketPayload, env.CMS_SESSION_SECRET)}`;
      const base = env.MEDIA_PUBLIC_BASE_URL.replace(/\/$/, "");
      return json({ uploadUrl: `${base}/media-upload/${ticket}`, publicUrl: `${base}/media/${key}` });
    }

    if (path.startsWith("/media-upload/") && request.method === "PUT") {
      const ticket = path.slice("/media-upload/".length);
      const [payloadPart, signature] = ticket.split(".");
      if (!payloadPart || !signature || (await sign(payloadPart, env.CMS_SESSION_SECRET)) !== signature) return new Response("Invalid upload ticket", { status: 401, headers: corsHeaders });
      let claims: { key: string; contentType: string; size: number; exp: number };
      try { claims = JSON.parse(new TextDecoder().decode(decodeB64url(payloadPart))); } catch { return new Response("Invalid upload ticket", { status: 401, headers: corsHeaders }); }
      if (claims.exp < Math.floor(Date.now() / 1000)) return new Response("Upload ticket expired", { status: 401, headers: corsHeaders });
      const contentType = request.headers.get("content-type")?.split(";")[0] || "";
      const length = Number(request.headers.get("content-length") || 0);
      if (contentType !== claims.contentType || (length > 0 && length !== claims.size) || claims.size > MAX_UPLOAD_BYTES || !request.body) return new Response("Upload details do not match ticket", { status: 400, headers: corsHeaders });
      await env.MEDIA.put(claims.key, request.body, { httpMetadata: { contentType, cacheControl: "public, max-age=31536000, immutable" } });
      return json({ ok: true }, 200, corsHeaders);
    }


    return json({ error: "Not found." }, 404);
  },
};
