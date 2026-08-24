import { db } from "@/lib/db";
import { sendEmail } from "@/lib/integrations/email";
import { sendSms, sendWhatsApp } from "@/lib/integrations/sms";
import type { RequestChannel } from "@/generated/prisma/enums";

export async function dispatchMessage(params: {
  organizationId: string;
  reviewRequestId?: string;
  channel: RequestChannel;
  to: string;
  subject?: string;
  body: string;
}) {
  const message = await db.message.create({
    data: {
      organizationId: params.organizationId,
      reviewRequestId: params.reviewRequestId,
      channel: params.channel,
      provider: "pending",
      toAddress: params.to,
      subject: params.subject,
      body: params.body,
      status: "QUEUED",
    },
  });

  await db.messageEvent.create({ data: { messageId: message.id, type: "QUEUED" } });

  let result;
  let provider = "mock";
  if (params.channel === "EMAIL") {
    provider = "resend";
    result = await sendEmail({ to: params.to, subject: params.subject ?? "You have a message", html: `<p>${params.body.replace(/\n/g, "<br/>")}</p>`, text: params.body });
  } else if (params.channel === "SMS") {
    provider = "twilio";
    result = await sendSms({ to: params.to, body: params.body });
  } else {
    provider = "twilio-whatsapp";
    result = await sendWhatsApp({ to: params.to, body: params.body });
  }

  const status = result.mock ? "SIMULATED" : result.ok ? "SENT" : "FAILED";

  await db.message.update({
    where: { id: message.id },
    data: {
      status,
      provider: result.mock ? "mock" : provider,
      providerMessageId: result.providerMessageId ?? undefined,
      errorMessage: result.ok ? undefined : result.error,
    },
  });

  await db.messageEvent.create({
    data: { messageId: message.id, type: status, metadata: result.error ? { error: result.error } : undefined },
  });

  if (params.reviewRequestId) {
    await db.reviewRequest.update({
      where: { id: params.reviewRequestId },
      data: {
        status: status === "FAILED" ? "FAILED" : "SENT",
        sentAt: status === "FAILED" ? undefined : new Date(),
        failedAt: status === "FAILED" ? new Date() : undefined,
      },
    });
  }

  return { message, result, status };
}
