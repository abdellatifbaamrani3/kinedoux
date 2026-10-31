import { PhoneCall, PackageOpen, MapPinned } from "lucide-react";

const STEPS = [
  {
    icon: MapPinned,
    title: "1. كتكتب اسمك، رقمك ومدينتك",
    body: "ما كنطلبوش العنوان الكامل دابا. المدينة كافية باش فريق الدار البيضاء يعيط ليك فالوقت المناسب.",
  },
  {
    icon: PhoneCall,
    title: "2. كنعيطو ليك من كازا قبل ما نصيفطو",
    body: "كنأكدو الطلب، العنوان ووقت التوصيل. إلا ما جاوبتيش، الكولية ما كتمشيش — وهادشي كيقلّل الغلط فالباب.",
  },
  {
    icon: PackageOpen,
    title: "3. كتفتح الكولية، ومن بعد تخلّص",
    body: "تشوف المنتوج والدليل قدام الليفرور. الخلاص نقداً عند الاستلام، وتبديل فابور فـ 14 يوم.",
  },
];

export function ConfirmationSection() {
  return (
    <section className="bg-white py-16" id="how-we-confirm">
      <div className="kd-container">
        <p className="kd-kicker mb-2">Confirmation depuis Casablanca</p>
        <h2 className="kd-h2 mb-2">كيفاش كيوصل الطلب، بلا مفاجآت</h2>
        <p className="mb-8 max-w-2xl text-muted">
          أغلب الرفض كيكون ملي الزبون ما عرفش شكون غادي يعيط ليه. عند كينيدو، التأكيد واضح قبل ما تتحرك الكولية.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <article key={step.title} className="kd-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sage text-brand">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-brand-dark">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
