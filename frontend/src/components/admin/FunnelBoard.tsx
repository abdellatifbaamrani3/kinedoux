"use client";

import { useEffect, useState } from "react";

import { useAdminLang } from "@/components/admin/AdminShell";
import { text } from "@/components/admin/copy";

type Change = number | null;

type Report = {
  traffic: {
    visitors: number;
    visitors_change: Change;
    sessions: number;
    sessions_change: Change;
    page_views: number;
    page_views_change: Change;
    product_views: number;
    product_views_change: Change;
    bounce_rate: number | null;
    bounce_rate_change: Change;
  };
  funnel: { step: string; count: number; drop_pct: number | null }[];
  conversion_rate: number | null;
  conversion_rate_change: Change;
  orders_change: Change;
  pipeline: {
    orders: number;
    pending: number;
    calling: number;
    confirmed: number;
    cancelled: number;
    fake: number;
    duplicate: number;
    in_transit: number;
    delivered: number;
    returned: number;
    confirmation_rate: number | null;
    delivery_rate: number | null;
    success_rate: number | null;
    hours_to_confirm: number | null;
    hours_to_deliver: number | null;
  };
  by_source: { key: string; visitors: number; orders: number }[];
  by_campaign: { key: string; visitors: number; orders: number }[];
  by_ad: { key: string; visitors: number; orders: number }[];
  by_device: { key: string; visitors: number }[];
  by_city: { key: string; orders: number; confirmation_rate: number | null; delivery_rate: number | null }[];
};

const RANGES = [
  ["today", "today"],
  ["yesterday", "yesterday"],
  ["7d", "last7"],
  ["30d", "last30"],
  ["month", "thisMonth"],
] as const;

function pct(value: number | null) {
  return value === null ? "—" : `${value}%`;
}

function delta(value: Change, fresh: string) {
  if (value === null) return fresh;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export function FunnelBoard({ mode }: { mode: "summary" | "breakdown" }) {
  const lang = useAdminLang();
  const t = text(lang);
  const [range, setRange] = useState("7d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const query = range === "custom" && from && to ? `range=custom&date_from=${from}&date_to=${to}` : `range=${range}`;

  useEffect(() => {
    if (range === "custom" && (!from || !to)) return;
    let gone = false;
    fetch(`/api/admin/metrics?${query}`)
      .then(async (response) => {
        if (response.status === 401) {
          window.location.href = "/admin/login";
          return null;
        }
        const body = await response.json();
        if (!response.ok) throw new Error(body.detail || "Could not load");
        return body as Report;
      })
      .then((body) => {
        if (!gone && body) setReport(body);
      })
      .catch((reason: Error) => {
        if (!gone) setError(reason.message);
      });
    return () => {
      gone = true;
    };
  }, [query, range, from, to]);

  const stepName: Record<string, string> = {
    visitors: t.visitors,
    product_views: t.productViews,
    checkout_starts: lang === "fr" ? "Formulaire commencé" : "Checkout started",
    orders: t.orders,
  };

  const max = Math.max(1, ...(report?.funnel.map((step) => step.count) || [1]));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {RANGES.map(([id, label]) => (
          <button key={id} type="button" className={`rounded-full px-3 py-1 text-sm ${range === id ? "bg-brand text-white" : "bg-white dark:bg-slate-900"}`} onClick={() => setRange(id)}>
            {t[label]}
          </button>
        ))}
        <button type="button" className={`rounded-full px-3 py-1 text-sm ${range === "custom" ? "bg-brand text-white" : "bg-white dark:bg-slate-900"}`} onClick={() => setRange("custom")}>
          {t.from}–{t.to}
        </button>
        {range === "custom" ? (
          <>
            <input className="rounded-lg border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            <input className="rounded-lg border px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </>
        ) : null}
      </div>
      {error ? <p className="text-sm text-coral">{error}</p> : null}
      {!report ? null : mode === "summary" ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Card label={t.visitors} value={String(report.traffic.visitors)} change={delta(report.traffic.visitors_change, t.newPeriod)} />
            <Card label={t.sessions} value={String(report.traffic.sessions)} change={delta(report.traffic.sessions_change, t.newPeriod)} />
            <Card label={t.pageViews} value={String(report.traffic.page_views)} change={delta(report.traffic.page_views_change, t.newPeriod)} />
            <Card label={t.productViews} value={String(report.traffic.product_views)} change={delta(report.traffic.product_views_change, t.newPeriod)} />
            <Card label={t.bounce} value={pct(report.traffic.bounce_rate)} change={delta(report.traffic.bounce_rate_change, t.newPeriod)} />
            <Card label={t.conversion} value={pct(report.conversion_rate)} change={delta(report.conversion_rate_change, t.newPeriod)} />
          </div>
          <section className="rounded-xl bg-white p-4 shadow-card dark:bg-slate-900">
            <h2 className="text-sm font-semibold">{t.funnel}</h2>
            <div className="mt-3 space-y-3">
              {report.funnel.map((step) => (
                <div key={step.step}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{stepName[step.step] || step.step}</span>
                    <span>
                      {step.count}
                      {step.drop_pct !== null ? ` · ${step.drop_pct}% ${t.drop}` : ""}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-2 rounded-full bg-brand" style={{ width: `${Math.max(4, (step.count / max) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl bg-white p-4 shadow-card dark:bg-slate-900">
            <h2 className="text-sm font-semibold">{t.confirmedReach}</h2>
            <p className="mt-1 text-xs text-slate-500">{t.confirmedHint}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card label={t.orders} value={String(report.pipeline.orders)} change={delta(report.orders_change, t.newPeriod)} />
              <Card label={t.pending} value={String(report.pipeline.pending)} />
              <Card label={t.calling} value={String(report.pipeline.calling)} />
              <Card label={t.confirmedReach} value={String(report.pipeline.confirmed)} />
              <Card label={t.confirmationRate} value={pct(report.pipeline.confirmation_rate)} />
              <Card label={t.shippedNow} value={String(report.pipeline.in_transit)} />
              <Card label={t.delivered} value={String(report.pipeline.delivered)} />
              <Card label={t.returned} value={String(report.pipeline.returned)} />
              <Card label={t.deliveryRate} value={pct(report.pipeline.delivery_rate)} />
              <Card label={t.successRate} value={pct(report.pipeline.success_rate)} />
              <Card label={t.hoursConfirm} value={report.pipeline.hours_to_confirm === null ? "—" : String(report.pipeline.hours_to_confirm)} />
              <Card label={t.hoursDeliver} value={report.pipeline.hours_to_deliver === null ? "—" : String(report.pipeline.hours_to_deliver)} />
            </div>
          </section>
        </>
      ) : (
        <div className="space-y-4">
          <Split title={t.source} rows={report.by_source} visitors={t.visitors} orders={t.orders} />
          <Split title={t.campaign} rows={report.by_campaign} visitors={t.visitors} orders={t.orders} />
          <Split title={t.ad} rows={report.by_ad} visitors={t.visitors} orders={t.orders} />
          <section className="rounded-xl bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="font-semibold">{t.device}</h2>
            {report.by_device.length === 0 ? <p className="mt-2 text-slate-500">{t.noTraffic}</p> : null}
            <ul className="mt-2 space-y-1">
              {report.by_device.map((row) => (
                <li key={row.key} className="flex justify-between">
                  <span>{row.key}</span>
                  <span>{row.visitors}</span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-xl bg-white p-4 text-sm shadow-card dark:bg-slate-900">
            <h2 className="font-semibold">{t.city}</h2>
            {report.by_city.length === 0 ? <p className="mt-2 text-slate-500">{t.noTraffic}</p> : null}
            <ul className="mt-2 space-y-2">
              {report.by_city.map((row) => (
                <li key={row.key} className="flex flex-wrap justify-between gap-2">
                  <span>{row.key}</span>
                  <span>
                    {row.orders} · {pct(row.confirmation_rate)} · {pct(row.delivery_rate)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, change }: { label: string; value: string; change?: string }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-card dark:bg-slate-900">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold">{value}</p>
      {change ? <p className="text-xs text-slate-500">{change}</p> : null}
    </div>
  );
}

function Split({ title, rows, visitors, orders }: { title: string; rows: { key: string; visitors: number; orders: number }[]; visitors: string; orders: string }) {
  return (
    <section className="rounded-xl bg-white p-4 text-sm shadow-card dark:bg-slate-900">
      <h2 className="font-semibold">{title}</h2>
      {rows.length === 0 ? <p className="mt-2 text-slate-500">—</p> : null}
      <ul className="mt-2 space-y-2">
        {rows.map((row) => (
          <li key={row.key} className="flex justify-between gap-3">
            <span className="truncate">{row.key}</span>
            <span className="shrink-0 text-slate-500">
              {visitors} {row.visitors} · {orders} {row.orders}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
