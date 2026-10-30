import { BadgeCheck, MapPin, Shield, Truck } from "lucide-react";

import { TRUST_PILLS } from "@/data/content";

const ICONS = [MapPin, Shield, Truck, BadgeCheck];

export function TrustBar() {
  return (
    <section className="border-y border-brand/10 bg-white">
      <div className="kd-container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_PILLS.map((p, i) => {
          const Icon = ICONS[i] ?? BadgeCheck;
          return (
            <div key={p.title} className="flex items-start gap-3 text-right">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-brand">{p.title}</p>
                <p className="mt-1 text-sm text-muted">{p.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
