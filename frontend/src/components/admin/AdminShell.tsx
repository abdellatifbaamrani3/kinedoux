"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

import { type AdminLang, text } from "@/components/admin/copy";

const LangContext = createContext<AdminLang>("en");

export function useAdminLang() {
  return useContext(LangContext);
}

const LINKS = [
  { href: "/admin", key: "dashboard" as const, ready: true },
  { href: "/admin/orders", key: "orders" as const, ready: true },
  { href: "/admin/analytics", key: "analytics" as const, ready: true },
  { href: "/admin/activity", key: "activity" as const, ready: true },
  { href: "/admin/campaigns", key: "campaigns" as const, ready: false },
  { href: "/admin/settings", key: "settings" as const, ready: true },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [lang, setLang] = useState<AdminLang>("en");
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const t = text(lang);

  useEffect(() => {
    const storedLang = window.localStorage.getItem("kd_admin_lang");
    const storedTheme = window.localStorage.getItem("kd_admin_theme");
    if (storedLang === "fr" || storedLang === "en") {
      setLang(storedLang);
      document.documentElement.lang = storedLang;
    }
    setDark(storedTheme === "dark");
    fetch("/api/admin/me")
      .then((response) => {
        if (!response.ok) router.replace("/admin/login");
        else setReady(true);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  function chooseLang(next: AdminLang) {
    setLang(next);
    window.localStorage.setItem("kd_admin_lang", next);
    document.documentElement.lang = next;
  }

  function chooseTheme(next: boolean) {
    setDark(next);
    window.localStorage.setItem("kd_admin_theme", next ? "dark" : "light");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <LangContext.Provider value={lang}>
    <div className={`${dark ? "dark" : ""} font-sans text-slate-900`}>
      <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <div className="flex min-h-screen">
          <aside className={`${open ? "block" : "hidden"} absolute inset-y-0 z-20 w-64 border-r border-slate-200 bg-white p-4 md:static md:block dark:border-slate-800 dark:bg-slate-900`}>
            <p className="px-2 text-sm font-semibold text-brand">{t.brand}</p>
            <nav className="mt-6 space-y-1">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${(link.href === "/admin" ? pathname === "/admin" : pathname === link.href) ? "bg-teal-50 text-brand dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  <span>{t[link.key]}</span>
                  {link.ready ? null : <span className="text-[10px] uppercase tracking-wide text-slate-400">{t.later}</span>}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 flex-1">
            <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <button type="button" className="rounded-md border px-2 py-1 text-sm md:hidden" onClick={() => setOpen((value) => !value)}>
                Menu
              </button>
              <div className="ml-auto flex items-center gap-2 text-sm">
                <button type="button" className="rounded-md border px-2 py-1" onClick={() => chooseLang(lang === "en" ? "fr" : "en")}>
                  {lang === "en" ? "FR" : "EN"}
                </button>
                <button type="button" className="rounded-md border px-2 py-1" onClick={() => chooseTheme(!dark)}>
                  {dark ? "Light" : "Dark"}
                </button>
                <button type="button" className="rounded-md border px-2 py-1" onClick={logout}>
                  {t.logout}
                </button>
              </div>
            </header>
            <main className="p-4 md:p-6">{ready ? children : null}</main>
          </div>
        </div>
      </div>
    </div>
    </LangContext.Provider>
  );
}
