import Link from "next/link";

export default function NotFound() {
  return (
    <section className="kd-container py-24 text-center">
      <h1 className="kd-h1">هاد الصفحة ما كايناش</h1>
      <p className="mt-4 text-muted">رجع لكينيدو واكتشف لومبا، بوسطا وكالما.</p>
      <Link href="/" className="kd-cta mx-auto mt-8 max-w-xs">
        الصفحة الرئيسية
      </Link>
    </section>
  );
}
