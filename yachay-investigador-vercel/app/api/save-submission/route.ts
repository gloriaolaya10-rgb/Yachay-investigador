import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const webhookUrl = process.env.REPORT_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json({ ok: true, saved: false, message: "Webhook no configurado. El caso se mantiene solo en el navegador." });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        createdAt: new Date().toISOString(),
        anonymous: true
      })
    });

    return NextResponse.json({ ok: response.ok, saved: response.ok });
  } catch {
    return NextResponse.json({ ok: false, saved: false }, { status: 200 });
  }
}
