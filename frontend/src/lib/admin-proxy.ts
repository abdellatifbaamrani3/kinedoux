import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "kd_admin";
const MAX_AGE = 60 * 60 * 24 * 14;

export function apiBase() {
  return (process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

export function sessionCookie(token: string) {
  return {
    name: ADMIN_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: MAX_AGE,
    },
  };
}

export async function proxyAdmin(request: Request, path: string) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Login required" }, { status: 401, headers: privateHeaders() });
  }
  const incoming = new URL(request.url);
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const upstream = await fetch(`${apiBase()}/api/v1/admin/${path}${incoming.search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    cache: "no-store",
  });
  const responseHeaders = privateHeaders();
  const type = upstream.headers.get("content-type");
  if (type) responseHeaders.set("content-type", type);
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) responseHeaders.set("content-disposition", disposition);
  return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
}

function privateHeaders() {
  const headers = new Headers();
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return headers;
}
