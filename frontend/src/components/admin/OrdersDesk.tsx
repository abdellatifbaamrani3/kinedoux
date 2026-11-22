"use client";

import { useCallback, useEffect, useState } from "react";

import { useAdminLang } from "@/components/admin/AdminShell";
import { STATUSES, statusName, text } from "@/components/admin/copy";

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string | null;
  name: string;
  phone: string;
  city: string | null;
  address: string | null;
  product: string;
  quantity: number;
  price_mad: number;
  status: string;
  allowed_next: string[];
  call_attempts: number;
  notes: string | null;
  campaign: string | null;
  tracking_number: string | null;
  duplicate: boolean;
  blacklisted: boolean;
};

type HistoryItem = {
  id: number;
  actor_email: string;
  from_status: string | null;
  to_status: string;
  note: string | null;
  created_at: string | null;
};

const EMPTY_FILTERS = { q: "", city: "", campaign: "", status: "", date_from: "", date_to: "" };

function waiting(value: string | null, now: number) {
  if (!value) return null;
  const hours = (now - new Date(value).getTime()) / 3600000;
  if (!Number.isFinite(hours) || hours < 0) return null;
  const text = hours < 1 ? `${Math.max(1, Math.round(hours * 60))}m` : `${Math.floor(hours)}h`;
  return { text, late: hours >= 2 };
}

function when(value: string | null, lang: "en" | "fr") {
  if (!value) return "";
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-MA" : "en-GB", {
    timeZone: "Africa/Casablanca",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function whatsappText(order: OrderRow) {
  const city = order.city || "";
  return `السلام، معك كينيدو. كنأكدو الطلب ديالك: ${order.product}، ${order.price_mad} درهم، الخلاص عند الباب. المدينة: ${city}. واش هادشي صحيح؟`;
}

export function OrdersDesk() {
  const lang = useAdminLang();
  const t = text(lang);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [items, setItems] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [bulk, setBulk] = useState("confirmed");
  const [history, setHistory] = useState<HistoryItem[] | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), page_size: "50" });
    for (const [key, value] of Object.entries(applied)) {
      if (value) params.set(key, value);
    }
    const response = await fetch(`/api/admin/orders?${params.toString()}`);
    if (response.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const body = await response.json();
    if (!response.ok) {
      setError(body.detail || "Could not load orders");
      return;
    }
    setError("");
    setItems(body.items || []);
    setTotal(body.total || 0);
  }, [applied, page]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  async function patch(id: string, payload: Record<string, string>) {
    const response = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.detail || "Update failed");
      return;
    }
    setItems((current) => current.map((row) => (row.id === id ? body : row)));
  }

  async function exportCsv() {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(applied)) {
      if (value) params.set(key, value);
    }
    const response = await fetch(`/api/admin/orders/export?${params.toString()}`);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kinedoux-orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function applyBulk() {
    if (!picked.length) return;
    const response = await fetch("/api/admin/orders/bulk-status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: picked, status: bulk }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(body.detail || "Update failed");
      return;
    }
    setPicked([]);
    await load();
  }

  async function block(order: OrderRow) {
    const response = await fetch("/api/admin/blacklist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone_e164: order.phone, reason: "desk" }),
    });
    if (response.ok) await load();
  }

  async function openHistory(id: string) {
    const response = await fetch(`/api/admin/orders/${id}/history`);
    const body = await response.json();
    setHistory(body.items || []);
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-2 rounded-xl bg-white p-3 shadow-card md:grid-cols-6 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setApplied(filters);
        }}
      >
        <input className="rounded-lg border px-3 py-2 text-sm md:col-span-2 dark:border-slate-700 dark:bg-slate-950" placeholder={t.search} value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} />
        <input className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder={t.city} value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })} />
        <input className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder={t.campaign} value={filters.campaign} onChange={(event) => setFilters({ ...filters, campaign: event.target.value })} />
        <select className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          <option value="">{t.status}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{statusName(lang, status)}</option>
          ))}
        </select>
        <button className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white" type="submit">{t.apply}</button>
        <input className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" type="date" aria-label={t.from} value={filters.date_from} onChange={(event) => setFilters({ ...filters, date_from: event.target.value })} />
        <input className="rounded-lg border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950" type="date" aria-label={t.to} value={filters.date_to} onChange={(event) => setFilters({ ...filters, date_to: event.target.value })} />
        <button className="rounded-lg border px-3 py-2 text-sm md:col-span-2" type="button" onClick={exportCsv}>{t.export}</button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span>{picked.length} {t.selected} / {total}</span>
        <select className="rounded-lg border px-2 py-1 dark:border-slate-700 dark:bg-slate-950" value={bulk} onChange={(event) => setBulk(event.target.value)}>
          {STATUSES.filter((status) => status !== "new").map((status) => (
            <option key={status} value={status}>{statusName(lang, status)}</option>
          ))}
        </select>
        <button type="button" className="rounded-lg border px-3 py-1" onClick={applyBulk}>{t.bulk}</button>
      </div>
      {error ? <p className="rounded-lg bg-orange-50 px-3 py-2 text-sm text-coral">{error}</p> : null}

      {items.length === 0 ? <p className="text-sm text-slate-500">{t.empty}</p> : null}
      <div className="space-y-3">
        {items.map((order) => (
          <article key={order.id} className="rounded-xl bg-white p-4 shadow-card dark:bg-slate-900">
            <div className="flex flex-wrap items-start gap-3">
              <input
                type="checkbox"
                className="mt-1"
                checked={picked.includes(order.id)}
                onChange={(event) => setPicked((current) => (event.target.checked ? [...current, order.id] : current.filter((id) => id !== order.id)))}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{order.name}</p>
                  <span className="text-xs text-slate-500">{order.order_number}</span>
                  <span className="text-xs text-slate-500">{when(order.created_at, lang)}</span>
                  {order.status === "new" && waiting(order.created_at, now) ? (
                    <span className={`text-xs font-semibold ${waiting(order.created_at, now)?.late ? "text-red-600" : "text-slate-500"}`}>
                      {t.waiting} {waiting(order.created_at, now)?.text}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm" dir="auto">{order.product}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {order.phone} · {order.city || "—"}{order.address ? ` · ${order.address}` : ""} · {t.qty} {order.quantity} · {order.price_mad} {t.price}
                </p>
                <p className="mt-1 text-xs text-slate-500">{order.campaign || ""} · {t.attempts}: {order.call_attempts}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.duplicate ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">{t.duplicate}</span> : null}
                  {order.blacklisted ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{t.blocked}</span> : null}
                  <span className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-brand">{statusName(lang, order.status)}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              <select
                className="rounded-lg border px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                value={order.status}
                onChange={(event) => void patch(order.id, { status: event.target.value })}
              >
                <option value={order.status}>{statusName(lang, order.status)}</option>
                {order.allowed_next.map((status) => (
                  <option key={status} value={status}>{statusName(lang, status)}</option>
                ))}
              </select>
              <input
                className="rounded-lg border px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                placeholder={t.tracking}
                defaultValue={order.tracking_number || ""}
                onBlur={(event) => {
                  if (event.target.value !== (order.tracking_number || "")) void patch(order.id, { tracking_number: event.target.value });
                }}
              />
              <textarea
                className="rounded-lg border px-2 py-2 text-sm md:col-span-2 dark:border-slate-700 dark:bg-slate-950"
                placeholder={t.notes}
                defaultValue={order.notes || ""}
                rows={2}
                onBlur={(event) => {
                  if (event.target.value !== (order.notes || "")) void patch(order.id, { notes: event.target.value });
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <a className="rounded-lg bg-slate-900 px-3 py-2 text-white dark:bg-white dark:text-slate-900" href={`tel:${order.phone}`}>{t.call}</a>
              <a className="rounded-lg bg-wa px-3 py-2 text-white" target="_blank" rel="noreferrer" href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(whatsappText(order))}`}>{t.whatsapp}</a>
              <button type="button" className="rounded-lg border px-3 py-2" onClick={() => void openHistory(order.id)}>{t.history}</button>
              {order.blacklisted ? null : (
                <button type="button" className="rounded-lg border px-3 py-2" onClick={() => void block(order)}>{t.block}</button>
              )}
            </div>
          </article>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" className="rounded-lg border px-3 py-1 text-sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button>
        <button type="button" className="rounded-lg border px-3 py-1 text-sm" disabled={page * 50 >= total} onClick={() => setPage((value) => value + 1)}>Next</button>
      </div>
      {history ? (
        <div className="rounded-xl border bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">{t.history}</p>
            <button type="button" onClick={() => setHistory(null)}>Close</button>
          </div>
          <ul className="space-y-2">
            {history.map((item) => (
              <li key={item.id}>
                {when(item.created_at, lang)} · {item.actor_email} · {statusName(lang, item.from_status || "")} → {statusName(lang, item.to_status)}
                {item.note ? ` · ${item.note}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
