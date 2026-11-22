import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { apiBase } from "@/lib/admin-proxy";

export async function POST(request: Request) {
  const jar = await cookies();
  const headers = new Headers({ "content-type": "application/json" });
  const session = jar.get("kd_admin")?.value;
  if (session) headers.set("x-admin-session", session);
  const agent = request.headers.get("user-agent");
  if (agent) headers.set("user-agent", agent);
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) headers.set("x-forwarded-for", forwarded);
  const upstream = await fetch(`${apiBase()}/api/v1/orders`, {
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
