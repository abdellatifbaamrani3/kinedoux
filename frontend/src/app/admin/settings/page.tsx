"use client";

import { useEffect, useState } from "react";

import { AdminShell, useAdminLang } from "@/components/admin/AdminShell";
import { text } from "@/components/admin/copy";

type Row = { phone_e164: string; reason: string | null; created_at: string | null };

function Blacklist() {
  const t = text(useAdminLang());
  const [rows, setRows] = useState<Row[]>([]);

  async function load() {
    const response = await fetch("/api/admin/blacklist");
    if (!response.ok) return;
    const body = await response.json();
    setRows(body.items || []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function remove(phone: string) {
    await fetch(`/api/admin/blacklist/${encodeURIComponent(phone)}`, { method: "DELETE" });
    await load();
  }

  return (
    <section>
      <h1 className="text-lg font-semibold">{t.blacklistTitle}</h1>
      {rows.length === 0 ? <p className="mt-3 text-sm text-slate-500">{t.blacklistEmpty}</p> : null}
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.phone_e164} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm dark:bg-slate-900">
            <span>{row.phone_e164}{row.reason ? ` · ${row.reason}` : ""}</span>
            <button type="button" className="rounded-md border px-2 py-1" onClick={() => void remove(row.phone_e164)}>{t.unblock}</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SettingsPage() {
  return (
    <AdminShell>
      <Blacklist />
    </AdminShell>
  );
}
