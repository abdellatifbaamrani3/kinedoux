import { NextResponse } from "next/server";

type ContactBody = {
  full_name?: string;
  phone?: string;
  subject?: string;
  message?: string;
};

const upstream = (process.env.API_PROXY_TARGET || "https://api.kinedoux.com").replace(/\/$/, "");

export async function POST(request: Request) {
  let body: ContactBody;
  try {
    body = (await request.json()) as ContactBody;
  } catch {
    return NextResponse.json({ detail: "المرجو التأكد من البيانات ثم المحاولة مرة أخرى." }, { status: 400 });
  }

  let saved: Response;
  try {
    saved = await fetch(`${upstream}/api/v1/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { detail: "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى." },
      { status: 502 },
    );
  }

  const data = (await saved.json().catch(() => ({ detail: "تعذر حفظ الرسالة." }))) as { detail?: string; ok?: boolean };
  if (!saved.ok) {
    return NextResponse.json(data, { status: saved.status });
  }

  const mailed = await sendContactEmail(body);
  if (!mailed.ok) {
    return NextResponse.json(
      { detail: "تُحفظت الرسالة، لكن الإيميل ما وصلش لصندوقك. حاول مرة أخرى." },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: saved.status });
}

async function sendContactEmail(body: ContactBody): Promise<{ ok: boolean }> {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const from = process.env.CONTACT_FROM_EMAIL || "contact@kinedoux.com";
  const to = process.env.CONTACT_TO_EMAIL || "abdellatifbaamrani3@gmail.com";
  if (!token || !account) return { ok: false };

  const subject = `Kinédoux — ${(body.subject || "رسالة جديدة").replace(/[\r\n]/g, " ").slice(0, 140)}`;
  const text = [`الاسم: ${body.full_name || ""}`, `الهاتف: ${body.phone || ""}`, `الموضوع: ${body.subject || ""}`, "", body.message || ""].join("\n");

  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/email/sending/send`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ to, from, subject, text }),
  });
  return { ok: res.ok };
}
