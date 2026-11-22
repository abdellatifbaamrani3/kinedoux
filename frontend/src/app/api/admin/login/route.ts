import { NextResponse } from "next/server";

import { apiBase, sessionCookie } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const body = await request.text();
  const upstream = await fetch(`${apiBase()}/api/v1/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    cache: "no-store",
  });
  const payload = (await upstream.json().catch(() => ({}))) as { token?: string; email?: string; detail?: string };
  if (!upstream.ok || !payload.token) {
    return NextResponse.json(
      { detail: payload.detail || "Invalid email or password" },
      { status: upstream.status || 401, headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "private, no-store" } },
    );
  }
  const response = NextResponse.json(
    { email: payload.email },
    { headers: { "X-Robots-Tag": "noindex, nofollow", "Cache-Control": "private, no-store" } },
  );
  const cookie = sessionCookie(payload.token);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
