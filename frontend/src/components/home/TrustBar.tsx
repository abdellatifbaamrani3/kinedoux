import { BadgeCheck, MapPin, Shield, Truck } from "lucide-react";

import { TRUST_PILLS } from "@/data/content";

const ICONS = [MapPin, Shield, Truck, BadgeCheck];

export function TrustBar() {
  return (
    <section className="bg-sage">
      <div className="kd-container py-6">
        <ul className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible md:pb-0">
          {TRUST_PILLS.map((p, i) => {
            const Icon = ICONS[i] ?? BadgeCheck;
            return (
              <li
                key={p.title}
                className="flex min-w-[70%] items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-brand/10 md:min-w-0"
              >
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-brand">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-bold text-brand-dark">{p.title}</span>
                  <span className="mt-0.5 block text-sm text-muted">{p.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
