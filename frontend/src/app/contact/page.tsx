import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";

import { CONTACT } from "@/data/content";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "اتصل بنا",
  description: CONTACT.heroSubtitle,
};

const ICONS = [Phone, MapPin, Mail];

export default function ContactPage() {
  return (
    <>
      <header className="kd-container py-12">
        <p className="kd-kicker mb-3">Casablanca · 09:00–21:00</p>
        <h1 className="kd-h1">{CONTACT.heroTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{CONTACT.heroSubtitle}</p>
      </header>
      <section className="kd-container grid gap-6 pb-8 md:grid-cols-3">
        {CONTACT.cards.map((c, i) => {
          const Icon = ICONS[i] ?? Phone;
          return (
            <article key={c.title} className="kd-card p-5">
              <Icon className="mb-3 h-6 w-6 text-leaf-deep" />
              <h2 className="font-extrabold">{c.title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted">{c.body}</p>
            </article>
          );
        })}
      </section>
      <section className="kd-container pb-8">
        <ContactForm />
      </section>
      <FaqAccordion />
    </>
  );
}
