"use client";

import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { AdminShell } from "@/components/admin/AdminShell";

export default function ActivityPage() {
  return (
    <AdminShell>
      <ActivityFeed />
    </AdminShell>
  );
}
