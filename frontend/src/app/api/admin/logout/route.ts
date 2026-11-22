import { NextResponse } from "next/server";

import { ADMIN_COOKIE, proxyAdmin } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const upstream = await proxyAdmin(request, "logout");
  const response = NextResponse.json({ ok: true }, { status: upstream.status === 401 ? 200 : upstream.status });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
