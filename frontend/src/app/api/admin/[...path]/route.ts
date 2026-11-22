import { proxyAdmin } from "@/lib/admin-proxy";

async function handle(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyAdmin(request, path.join("/"));
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
