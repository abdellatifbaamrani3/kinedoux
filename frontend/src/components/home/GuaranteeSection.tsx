import Link from "next/link";

import { HOME } from "@/data/content";

export function GuaranteeSection() {
  return (
    <section className="bg-brand py-16 text-alabaster">
      <div className="kd-container max-w-3xl text-center">
        <p className="kd-kicker mb-3 text-leaf">14 jours · échange gratuit</p>
        <h2 className="text-3xl font-bold">{HOME.guarantee.title}</h2>
        <p className="mt-4 leading-8 text-alabaster/85">{HOME.guarantee.body}</p>
        <Link href="/collections" className="kd-cta mx-auto mt-8 max-w-md bg-white text-brand hover:bg-sage hover:text-brand-dark">
          ابدأ طلبك — الخلاص عند الاستلام
        </Link>
      </div>
    </section>
  );
}
