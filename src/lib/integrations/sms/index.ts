import { env, isMock } from "@/lib/env";

export type SendResult = { ok: boolean; providerMessageId: string | null; mock: boolean; error?: string };

async function sendViaTwilio(params: { to: string; body: string; from: string }): Promise<SendResult> {
  const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: params.to, From: params.from, Body: params.body }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, providerMessageId: null, mock: false, error: body };
  }

  const data = (await res.json()) as { sid: string };
  return { ok: true, providerMessageId: data.sid, mock: false };
}

export async function sendSms(params: { to: string; body: string }): Promise<SendResult> {
  if (isMock.sms) {
    console.log(`[mock:sms] to=${params.to}\n${params.body}`);
    return { ok: true, providerMessageId: `mock_sms_${Date.now()}`, mock: true };
  }
  return sendViaTwilio({ to: params.to, body: params.body, from: env.TWILIO_SMS_FROM });
}

export async function sendWhatsApp(params: { to: string; body: string }): Promise<SendResult> {
  if (isMock.sms) {
    console.log(`[mock:whatsapp] to=${params.to}\n${params.body}`);
    return { ok: true, providerMessageId: `mock_wa_${Date.now()}`, mock: true };
  }
  return sendViaTwilio({
    to: `whatsapp:${params.to}`,
    body: params.body,
    from: `whatsapp:${env.TWILIO_WHATSAPP_FROM}`,
  });
}
