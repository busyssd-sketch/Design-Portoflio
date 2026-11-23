import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifyCmsSession } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const needsAuth = pathname.startsWith("/cms") && !pathname.startsWith("/cms/login");
  if (!needsAuth) return NextResponse.next();

  const secret = process.env.CMS_SESSION_SECRET;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (secret && token && await verifyCmsSession(token, secret)) return NextResponse.next();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/cms/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}
export const config = { matcher: ["/cms/:path*"] };
