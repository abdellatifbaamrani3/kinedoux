import { MapPinned, PackageOpen, PhoneCall } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { uiCopy } from "@/i18n/ui";

const ICONS = [MapPinned, PhoneCall, PackageOpen];

export async function ConfirmationSection() {
  const ui = uiCopy(await getLocale());
  return (
    <section className="bg-white py-16" id="how-we-confirm">
      <div className="kd-container">
        <p className="kd-kicker mb-2">{ui.confirmKicker}</p>
        <h2 className="kd-h2 mb-2">{ui.confirmTitle}</h2>
        <p className="mb-8 max-w-2xl text-muted">{ui.confirmBody}</p>
        <div className="grid gap-4 md:grid-cols-3">
          {ui.confirmSteps.map((step, i) => {
            const Icon = ICONS[i] ?? MapPinned;
            return (
              <article key={step.title} className="kd-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage text-brand">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-brand-dark">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
