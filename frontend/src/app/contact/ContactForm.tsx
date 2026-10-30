"use client";

import { useMemo, useState, type FormEvent } from "react";

import { CONTACT } from "@/data/content";
import { api } from "@/lib/api";
import { phonePlaceholder, validateAndFormatPhone } from "@/lib/phone";
import { cn, whatsappLink } from "@/lib/utils";

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState<string>(CONTACT.subjects[0]);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [error, setError] = useState("");
  const phoneResult = useMemo(() => validateAndFormatPhone(phone), [phone]);
  const valid = fullName.trim().length >= 2 && phoneResult.isValid && message.trim().length >= 3;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setStatus("sending");
    setError("");
    try {
      await api.sendContact({ full_name: fullName.trim(), phone, subject, message: message.trim() });
      setStatus("ok");
      setMessage("");
    } catch (err) {
      setStatus("err");
      setError(err instanceof Error ? err.message : "تعذر إرسال الرسالة");
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={onSubmit} className="kd-card space-y-4 p-6">
        <h2 className="text-xl font-extrabold">أرسل رسالة لفريق كينيدو</h2>
        <label className="block text-sm font-bold">
          الاسم الكامل
          <input
            className="mt-1 w-full rounded-xl border-2 border-brand/15 bg-alabaster px-4 py-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-bold">
          رقم الهاتف
          <input
            dir="ltr"
            className="mt-1 w-full rounded-xl border-2 border-brand/15 bg-alabaster px-4 py-3 text-left font-sans"
            placeholder={phonePlaceholder()}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {phone ? (
            <span className={cn("mt-1 block text-xs", phoneResult.isValid ? "text-brand" : "text-coral")}>
              {phoneResult.isValid ? "✔ رقم هاتف صحيح" : phoneResult.errorMessage}
            </span>
          ) : null}
        </label>
        <label className="block text-sm font-bold">
          موضوع الرسالة
          <select
            className="mt-1 w-full rounded-xl border-2 border-brand/15 bg-alabaster px-4 py-3"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {CONTACT.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold">
          رسالتك
          <textarea
            className="mt-1 min-h-32 w-full rounded-xl border-2 border-brand/15 bg-alabaster px-4 py-3"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </label>
        {status === "ok" ? (
          <p className="rounded-xl bg-sage p-3 text-sm font-bold text-brand">توصلنا برسالتك. كنرجعو ليك قريب إن شاء الله.</p>
        ) : null}
        {status === "err" ? <p className="rounded-xl bg-coral/10 p-3 text-sm font-bold text-coral">{error}</p> : null}
        <button type="submit" className="kd-cta" disabled={!valid || status === "sending"}>
          {status === "sending" ? "جاري الإرسال..." : "إرسال الرسالة"}
        </button>
      </form>
      <a
        href={whatsappLink("السلام عليكم، بغيت نتواصل مع فريق كينيدو")}
        className="flex h-fit items-center justify-center gap-2 rounded-2xl bg-wa py-4 font-extrabold text-brand-dark"
      >
        تواصل فوري عبر واتساب
      </a>
    </div>
  );
}
