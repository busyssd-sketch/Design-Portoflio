import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: { path: string[] } };

async function proxy(request: NextRequest, context: RouteContext) {
  const base = process.env.CLOUDFLARE_CMS_API_URL?.replace(/\/$/, "");
  if (!base) return NextResponse.json({ error: "Cloudflare CMS API is not configured." }, { status: 503 });

  const path = context.params.path.join("/");
  const isLogin = path === "auth/login" && request.method === "POST";
  const isLogout = path === "auth/logout" && request.method === "POST";
  if (isLogout) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
    return response;
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!isLogin && !token) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const fileName = request.headers.get("x-file-name");
  if (fileName) headers.set("x-file-name", fileName);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();
  let upstream: Response;
  try {
    upstream = await fetch(`${base}/${path}`, { method: request.method, headers, body, cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Could not reach Cloudflare CMS API." }, { status: 502 });
  }

  const payload = await upstream.arrayBuffer();
  const contentTypeOut = upstream.headers.get("content-type") || "application/json";
  if (isLogin) {
    const result = JSON.parse(new TextDecoder().decode(payload)) as { token?: string; expiresIn?: number; error?: string };
    if (!upstream.ok) return NextResponse.json({ error: result.error || "Sign-in failed." }, { status: upstream.status });
    if (!result.token) return NextResponse.json({ error: "Cloudflare did not return a session." }, { status: 502 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.expiresIn || 604800,
    });
    return response;
  }

  return new NextResponse(payload, { status: upstream.status, headers: { "content-type": contentTypeOut } });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
