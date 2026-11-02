import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شكراً لطلبك",
  description: "تم تسجيل طلبك من كينيدو. فريقنا غادي يعيط ليك لتأكيد التوصيل والدفع عند الاستلام.",
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
