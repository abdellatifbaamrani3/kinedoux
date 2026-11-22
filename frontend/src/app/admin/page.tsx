"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { FunnelBoard } from "@/components/admin/FunnelBoard";

export default function DashboardPage() {
  return (
    <AdminShell>
      <FunnelBoard mode="summary" />
    </AdminShell>
  );
}
