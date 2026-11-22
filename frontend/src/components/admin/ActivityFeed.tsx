"use client";

import { useEffect, useState } from "react";

import { useAdminLang } from "@/components/admin/AdminShell";
import { text } from "@/components/admin/copy";

type Item = {
  id: number;
  event: string;
  visitor: string;
  path: string | null;
  source: string;
  campaign: string | null;
  created_at: string | null;
};

function when(value: string | null, lang: "en" | "fr") {
  if (!value) return "";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-MA" : "en-GB", {
    timeZone: "Africa/Casablanca",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export function ActivityFeed() {
  const lang = useAdminLang();
  const t = text(lang);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let gone = false;
    async function load() {
      const response = await fetch("/api/admin/activity");
      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }
      const body = await response.json();
      if (!gone && response.ok) setItems(body.items || []);
    }
    void load();
    const timer = window.setInterval(() => void load(), 5000);
    return () => {
      gone = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="rounded-xl bg-white p-4 text-sm shadow-card dark:bg-slate-900">
      {items.length === 0 ? <p className="text-slate-500">{t.noActivity}</p> : null}
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <span>
              <span className="font-semibold">{item.event}</span>
              <span className="text-slate-500"> · {item.visitor} · {item.path || "—"} · {item.source}{item.campaign ? ` / ${item.campaign}` : ""}</span>
            </span>
            <span className="text-xs text-slate-500">{when(item.created_at, lang)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
