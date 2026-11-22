"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { type AdminLang, text } from "@/components/admin/copy";

export default function AdminLoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<AdminLang>("en");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const t = text(lang);

  useEffect(() => {
    const stored = window.localStorage.getItem("kd_admin_lang");
    if (stored === "fr" || stored === "en") setLang(stored);
    fetch("/api/admin/me").then((response) => {
      if (response.ok) router.replace("/admin");
    });
  }, [router]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setPending(false);
    if (response.ok) {
      router.replace("/admin");
      return;
    }
    setError(response.status === 429 ? t.locked : t.badLogin);
  }

  return (
    <main className="font-sans mx-auto flex min-h-screen max-w-md flex-col justify-center px-4" dir="ltr">
      <button
        type="button"
        className="mb-6 self-end rounded-md border px-2 py-1 text-sm"
        onClick={() => {
          const next = lang === "en" ? "fr" : "en";
          setLang(next);
          window.localStorage.setItem("kd_admin_lang", next);
        }}
      >
        {lang === "en" ? "FR" : "EN"}
      </button>
      <h1 className="text-2xl font-semibold text-slate-900">{t.loginTitle}</h1>
      <p className="mt-2 text-sm text-slate-600">{t.loginHint}</p>
      <form className="mt-6 space-y-3" onSubmit={submit}>
        <label className="block text-sm">
          {t.email}
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="block text-sm">
          {t.password}
          <input className="mt-1 w-full rounded-lg border px-3 py-2" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        {error ? <p className="text-sm text-coral">{error}</p> : null}
        <button className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white" type="submit" disabled={pending}>
          {t.signIn}
        </button>
      </form>
    </main>
  );
}
