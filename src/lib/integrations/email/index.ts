import { env, isMock } from "@/lib/env";

export type SendResult = { ok: boolean; providerMessageId: string | null; mock: boolean; error?: string };

export async function sendEmail(params: { to: string; subject: string; html: string; text: string }): Promise<SendResult> {
  if (isMock.email) {
    console.log(`[mock:email] to=${params.to} subject="${params.subject}"\n${params.text}`);
    return { ok: true, providerMessageId: `mock_email_${Date.now()}`, mock: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, providerMessageId: null, mock: false, error: body };
  }

  const data = (await res.json()) as { id: string };
  return { ok: true, providerMessageId: data.id, mock: false };
}
