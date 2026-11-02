"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";

import { useLocale } from "@/i18n/locale-context";
import { localePath } from "@/i18n/locale";
import { money } from "@/i18n/money";
import { SectionHeading } from "@/components/ui/SectionHeading";

const LUMBA = "kenidoux-lumba";
const POSTA = "kenidoux-posta";
const CALMA = "kenidoux-calma";

const WEIGHTS: Record<string, Partial<Record<string, number>>> = {
  back: { [LUMBA]: 2 },
  posture: { [POSTA]: 2 },
  shoulders: { [CALMA]: 2 },
  drive: { [LUMBA]: 2 },
  screen: { [POSTA]: 2 },
  evening: { [CALMA]: 2 },
};

function recommend(a1: string, a2: string): string {
  const scores: Record<string, number> = { [LUMBA]: 0, [POSTA]: 0, [CALMA]: 0 };
  for (const answer of [a1, a2]) {
    for (const [slug, points] of Object.entries(WEIGHTS[answer] ?? {})) {
      scores[slug] += points ?? 0;
    }
  }
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-4 text-start text-sm transition ${
        selected
          ? "border-brand bg-sage font-bold text-brand-dark"
          : "border-brand/10 bg-white text-muted hover:border-brand/30"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
          selected ? "border-brand bg-brand text-white" : "border-brand/20"
        }`}
      >
        {selected ? <Check className="h-3.5 w-3.5" /> : null}
      </span>
      {label}
    </button>
  );
}

type Quiz = {
  eyebrow: string;
  title: string;
  sub: string;
  q1: { label: string; options: { id: string; label: string }[] };
  q2: { label: string; options: { id: string; label: string }[] };
  resultTitle: string;
  resultNote: string;
  cta: string;
  restart: string;
  bundleLabel: string;
};

type Pick = { slug: string; nameAr: string; cardSubheading: string; price: number };

export function QuickDiagnosis({
  quiz,
  picks,
  fromLabel,
}: {
  quiz: Quiz;
  picks: Record<string, Pick>;
  fromLabel: string;
}) {
  const locale = useLocale();
  const [a1, setA1] = useState<string | null>(null);
  const [a2, setA2] = useState<string | null>(null);
  const answered = a1 !== null && a2 !== null;
  const product = answered ? picks[recommend(a1!, a2!)] : undefined;
  const step = a1 === null ? 1 : a2 === null ? 2 : 3;

  return (
    <section id="quiz" className="kd-section bg-sage/70">
      <div className="kd-container">
        <SectionHeading eyebrow={quiz.eyebrow} title={quiz.title} sub={quiz.sub} />
        <div className="mx-auto mt-10 max-w-2xl rounded-2xl bg-white p-6 shadow-card ring-1 ring-brand/10 md:p-8">
          <div className="flex items-center gap-2" aria-hidden>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-action" : "bg-sage"}`}
              />
            ))}
          </div>

          <fieldset className="mt-6">
            <legend className="text-lg font-bold text-brand-dark">{quiz.q1.label}</legend>
            <div className="mt-4 space-y-3">
              {quiz.q1.options.map((o) => (
                <OptionButton key={o.id} label={o.label} selected={a1 === o.id} onClick={() => setA1(o.id)} />
              ))}
            </div>
          </fieldset>

          {a1 !== null ? (
            <fieldset className="mt-8 border-t border-brand/10 pt-8">
              <legend className="text-lg font-bold text-brand-dark">{quiz.q2.label}</legend>
              <div className="mt-4 space-y-3">
                {quiz.q2.options.map((o) => (
                  <OptionButton key={o.id} label={o.label} selected={a2 === o.id} onClick={() => setA2(o.id)} />
                ))}
              </div>
            </fieldset>
          ) : null}

          {product ? (
            <div className="mt-8 rounded-2xl border border-action/30 bg-sage p-6" role="status">
              <p className="kd-kicker text-brand">{quiz.resultTitle}</p>
              <h3 className="mt-2 text-2xl font-bold text-brand-dark">{product.nameAr}</h3>
              <p className="mt-1 text-sm text-muted">{product.cardSubheading}</p>
              <p className="mt-3 font-bold text-brand-dark">{fromLabel} {money(product.price, locale)}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link href={localePath(`/products/${product.slug}`, locale)} className="kd-cta sm:w-auto">
                  {quiz.cta}
                </Link>
                <Link href={localePath("/collections", locale)} className="kd-cta-secondary">
                  {quiz.bundleLabel}
                </Link>
              </div>
              <p className="mt-5 text-sm text-muted">{quiz.resultNote}</p>
              <button
                type="button"
                onClick={() => {
                  setA1(null);
                  setA2(null);
                }}
                className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand hover:underline"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                {quiz.restart}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
