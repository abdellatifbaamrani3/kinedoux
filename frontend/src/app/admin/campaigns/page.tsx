"use client";

import { AdminShell, useAdminLang } from "@/components/admin/AdminShell";
import { text } from "@/components/admin/copy";

function Later() {
  const t = text(useAdminLang());
  return <p className="text-sm text-slate-600 dark:text-slate-300">{t.coming}</p>;
}

export default function CampaignsPage() {
  return (
    <AdminShell>
      <Later />
    </AdminShell>
  );
}
