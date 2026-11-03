import { Mail, Phone } from "lucide-react";

import { getLocale } from "@/i18n/get-locale";
import { homeCopy } from "@/i18n/home-copy";
import { uiCopy } from "@/i18n/ui";
import { whatsappLink } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

export async function TrustLedger() {
  const locale = await getLocale();
  const ledger = homeCopy(locale).trustLedger;
  const ui = uiCopy(locale);

  return (
    <section className="kd-section bg-sage/70" id="trust">
      <div className="kd-container">
        <SectionHeading eyebrow={ledger.eyebrow} title={ledger.title} sub={ledger.note} />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
          {ledger.rules.map((rule, index) => (
            <article key={rule.title} className="rounded-2xl bg-white p-5 ring-1 ring-brand/10">
              <p className="font-sans text-sm font-bold text-brand">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-lg font-bold text-brand-dark">{rule.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{rule.body}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-6 max-w-5xl rounded-2xl bg-brand-dark p-6 text-white md:p-8">
          <p className="text-sm font-bold text-leaf">{ledger.deskEyebrow}</p>
          <h3 className="mt-2 text-2xl font-bold">{ledger.deskTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">{ledger.deskBody}</p>
          <p className="mt-4 text-sm font-bold text-leaf">{ledger.deskHours}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={whatsappLink(ui.whatsappMessage)}
              className="inline-flex items-center gap-2 rounded-full bg-wa px-4 py-2 text-sm font-bold text-brand-dark"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {ui.whatsappLong}
            </a>
            <a href="mailto:contact@kinedoux.com" className="inline-flex items-center gap-2 text-sm font-bold text-leaf">
              <Mail className="h-4 w-4" aria-hidden />
              contact@kinedoux.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
