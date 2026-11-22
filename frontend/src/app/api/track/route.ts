import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiBase } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const jar = await cookies();
  if (jar.get("kd_admin")) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  const headers = new Headers({ "content-type": "application/json" });
  const agent = request.headers.get("user-agent");
  if (agent) headers.set("user-agent", agent);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) headers.set("x-forwarded-for", forwarded);
  for (const name of ["cf-ipcountry", "x-vercel-ip-country", "x-vercel-ip-city"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const upstream = await fetch(`${apiBase()}/api/v1/track`, {
    method: "POST",
    headers,
    body: await request.text(),
    cache: "no-store",
  });
  return new NextResponse(await upstream.arrayBuffer(), {
    status: upstream.status,
    headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" },
  });
}
