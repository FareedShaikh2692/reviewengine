import { db } from "@/lib/db";
import { createReviewRequest } from "@/lib/review-requests";
import { notifyOrg } from "@/lib/notify";

const TERMINAL_ENROLLMENT_STATUSES = ["COMPLETED", "UNSUBSCRIBED", "FAILED"];

async function maybeCompleteCampaign(campaignId: string) {
  const campaign = await db.campaign.findUnique({ where: { id: campaignId }, include: { enrollments: true } });
  if (!campaign || campaign.status !== "RUNNING") return;
  if (campaign.enrollments.length === 0) return;
  const allTerminal = campaign.enrollments.every((e) => TERMINAL_ENROLLMENT_STATUSES.includes(e.status));
  if (!allTerminal) return;

  await db.campaign.update({ where: { id: campaignId }, data: { status: "COMPLETED" } });
  const completed = campaign.enrollments.filter((e) => e.status === "COMPLETED").length;
  await notifyOrg({
    organizationId: campaign.organizationId,
    type: "CAMPAIGN_COMPLETED",
    title: "Campaign completed",
    body: `"${campaign.name}" finished — ${completed} of ${campaign.enrollments.length} customers completed a review.`,
    metadata: { campaignId },
  });
}

export async function processCampaignTick() {
  const dueEnrollments = await db.campaignEnrollment.findMany({
    where: {
      status: { in: ["ENROLLED", "IN_PROGRESS"] },
      OR: [{ nextRunAt: null }, { nextRunAt: { lte: new Date() } }],
    },
    include: {
      customer: true,
      campaign: { include: { steps: { orderBy: { order: "asc" } } } },
    },
    take: 200,
  });

  const touchedCampaignIds = new Set<string>();

  for (const enrollment of dueEnrollments) {
    if (enrollment.campaign.status !== "RUNNING") continue;
    touchedCampaignIds.add(enrollment.campaignId);

    if (enrollment.customer.consentStatus !== "SUBSCRIBED") {
      await db.campaignEnrollment.update({ where: { id: enrollment.id }, data: { status: "UNSUBSCRIBED" } });
      continue;
    }
    if (enrollment.customer.status === "REVIEWED") {
      await db.campaignEnrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      continue;
    }

    const steps = enrollment.campaign.steps;
    const step = steps[enrollment.currentStepIndex];

    if (!step) {
      await db.campaignEnrollment.update({ where: { id: enrollment.id }, data: { status: "COMPLETED", completedAt: new Date() } });
      continue;
    }

    if (step.type === "SEND_REQUEST" || step.type === "REMINDER") {
      await createReviewRequest({
        organizationId: enrollment.customer.organizationId,
        businessId: enrollment.campaign.businessId,
        customerId: enrollment.customerId,
        channel: enrollment.campaign.channel,
        campaignId: enrollment.campaignId,
        template: step.messageTemplate,
      });
    }

    const nextStep = steps[enrollment.currentStepIndex + 1];
    const nextRunAt = nextStep
      ? new Date(Date.now() + Math.max(nextStep.dayOffset - step.dayOffset, 0) * 24 * 60 * 60 * 1000)
      : null;

    await db.campaignEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: nextStep ? "IN_PROGRESS" : "COMPLETED",
        currentStepIndex: enrollment.currentStepIndex + 1,
        nextRunAt,
        completedAt: nextStep ? undefined : new Date(),
      },
    });
  }

  for (const campaignId of touchedCampaignIds) {
    await maybeCompleteCampaign(campaignId);
  }
}
