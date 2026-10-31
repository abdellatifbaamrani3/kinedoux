import { FileText, MessageCircle, Scale, ShieldCheck } from "lucide-react";

import { HOME } from "@/data/content";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = [FileText, Scale, ShieldCheck, MessageCircle] as const;

export function CredentialsStrip() {
  return (
    <section id="credentials" className="kd-section bg-sage">
      <div className="kd-container">
        <SectionHeading eyebrow={HOME.credentials.eyebrow} title={HOME.credentials.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {HOME.credentials.items.map((item, i) => {
            const Icon = ICONS[i] ?? ShieldCheck;
            return (
              <article key={item.title} className="rounded-2xl bg-white p-6 ring-1 ring-brand/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sage text-brand">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand-dark">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{item.body}</p>
              </article>
            );
          })}
        </div>
        <p className="mx-auto mt-8 max-w-[42rem] text-center text-sm text-muted">{HOME.credentials.footer}</p>
      </div>
    </section>
  );
}
