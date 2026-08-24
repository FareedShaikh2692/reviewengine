import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import { DEFAULT_REQUEST_TEMPLATE, DEFAULT_REMINDER_TEMPLATE, renderTemplate } from "../src/lib/message-template";
import { PLAN_DEFS, PLATFORM_DEFS } from "./seed-data";

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  console.log("Seeding Review Engine demo data...");

  // ---------------- Plans ----------------
  const plans: Record<string, { id: string }> = {};
  for (const p of PLAN_DEFS) {
    plans[p.key] = await db.plan.upsert({
      where: { key: p.key },
      create: p,
      update: { name: p.name, priceMonthly: p.priceMonthly, priceYearly: p.priceYearly, limits: p.limits, features: p.features },
    });
  }

  // ---------------- Review platforms ----------------
  const platforms: Record<string, { id: string }> = {};
  for (const p of PLATFORM_DEFS) {
    platforms[p.key] = await db.reviewPlatform.upsert({
      where: { key: p.key },
      create: p,
      update: { name: p.name, reviewUrlTemplate: p.reviewUrlTemplate },
    });
  }

  // ---------------- Super admin ----------------
  const adminUser = await db.user.upsert({
    where: { email: "admin@reviewengine.app" },
    create: { email: "admin@reviewengine.app", name: "Platform Admin", passwordHash: await hash("Admin123!"), emailVerified: new Date() },
    update: {},
  });
  await db.adminUser.upsert({
    where: { userId: adminUser.id },
    create: { userId: adminUser.id, role: "SUPERADMIN" },
    update: {},
  });

  // ---------------- Org A: ABC Restaurant Group ----------------
  const ownerA = await db.user.upsert({
    where: { email: "owner@abcrestaurant.com" },
    create: { email: "owner@abcrestaurant.com", name: "Amina Khan", passwordHash: await hash("Password123!"), emailVerified: new Date() },
    update: {},
  });

  const orgA = await db.organization.upsert({
    where: { slug: "abc-restaurant" },
    create: { name: "ABC Restaurant Group", slug: "abc-restaurant", industry: "Restaurant", website: "https://abcrestaurant.example.com", phone: "+971 4 555 0101" },
    update: {},
  });

  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgA.id, userId: ownerA.id } },
    create: { organizationId: orgA.id, userId: ownerA.id, role: "OWNER", status: "ACTIVE" },
    update: {},
  });

  await db.subscription.upsert({
    where: { organizationId: orgA.id },
    create: { organizationId: orgA.id, planId: plans.GROWTH.id, status: "ACTIVE", currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    update: {},
  });

  let businessA = await db.business.findFirst({ where: { organizationId: orgA.id } });
  if (!businessA) {
    businessA = await db.business.create({
      data: {
        organizationId: orgA.id,
        name: "ABC Restaurant",
        industry: "Restaurant",
        description: "Modern Levantine dining in the heart of Dubai Marina.",
        phone: "+971 4 555 0101",
        website: "https://abcrestaurant.example.com",
        googlePlaceId: "mock-abc-restaurant-dubai",
      },
    });
  }

  let locMarina = await db.businessLocation.findFirst({ where: { businessId: businessA.id, name: "Dubai Marina" } });
  if (!locMarina) {
    locMarina = await db.businessLocation.create({
      data: { businessId: businessA.id, name: "Dubai Marina", address: "Sheikh Zayed Rd", city: "Dubai", country: "UAE", isPrimary: true, phone: "+971 4 555 0101" },
    });
  }
  let locAbuDhabi = await db.businessLocation.findFirst({ where: { businessId: businessA.id, name: "Abu Dhabi Corniche" } });
  if (!locAbuDhabi) {
    locAbuDhabi = await db.businessLocation.create({
      data: { businessId: businessA.id, name: "Abu Dhabi Corniche", address: "Corniche Road", city: "Abu Dhabi", country: "UAE", isPrimary: false, phone: "+971 2 555 0177" },
    });
  }

  await db.businessIntegration.upsert({
    where: { businessId_provider: { businessId: businessA.id, provider: "GOOGLE" } },
    create: { organizationId: orgA.id, businessId: businessA.id, provider: "GOOGLE", status: "CONNECTED", connectedAt: new Date(), metadata: { placeId: businessA.googlePlaceId } },
    update: {},
  });

  const tagNames = [
    { name: "VIP", color: "#8b5cf6" },
    { name: "Regular", color: "#6366f1" },
    { name: "New", color: "#22c55e" },
  ];
  const tags: Record<string, { id: string }> = {};
  for (const t of tagNames) {
    tags[t.name] = await db.customerTag.upsert({
      where: { organizationId_name: { organizationId: orgA.id, name: t.name } },
      create: { organizationId: orgA.id, name: t.name, color: t.color },
      update: {},
    });
  }

  const firstNames = ["Sarah", "Mohammed", "Elena", "James", "Fatima", "Liam", "Noor", "Carlos", "Aisha", "David", "Layla", "Omar", "Priya", "Yusuf", "Grace", "Hassan", "Mia", "Khalid"];
  const lastNames = ["Miller", "Al Farsi", "Petrova", "Chen", "Haddad", "O'Brien", "Rahman", "Diaz", "Malik", "Cohen", "Nasser", "Sato", "Iyer", "Ibrahim", "Kim", "Saleh", "Novak", "Sultan"];
  const statuses = ["NEW", "CONTACTED", "REVIEW_REQUESTED", "CLICKED", "REVIEWED", "REVIEWED", "REVIEW_REQUESTED"] as const;

  const customers: { id: string; firstName: string; status: string }[] = [];
  for (let i = 0; i < firstNames.length; i++) {
    const status = statuses[i % statuses.length];
    const existing = await db.customer.findFirst({ where: { organizationId: orgA.id, email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace(/[^a-z]/g, "")}@example.com` } });
    const customer =
      existing ??
      (await db.customer.create({
        data: {
          organizationId: orgA.id,
          businessId: businessA.id,
          locationId: i % 3 === 0 ? locAbuDhabi.id : locMarina.id,
          firstName: firstNames[i],
          lastName: lastNames[i],
          email: `${firstNames[i].toLowerCase()}.${lastNames[i].toLowerCase().replace(/[^a-z]/g, "")}@example.com`,
          phone: `+9715${(50000000 + i * 137).toString().slice(0, 8)}`,
          company: i % 4 === 0 ? "Corporate account" : undefined,
          serviceProduct: "Dine-in experience",
          purchaseDate: new Date(Date.now() - i * 4 * 24 * 60 * 60 * 1000),
          status,
          consentStatus: i === firstNames.length - 1 ? "UNSUBSCRIBED" : "SUBSCRIBED",
          source: i % 5 === 0 ? "CSV" : "MANUAL",
          lastReviewRequestAt: status !== "NEW" ? new Date(Date.now() - i * 3 * 24 * 60 * 60 * 1000) : null,
        },
      }));
    customers.push({ id: customer.id, firstName: customer.firstName, status });

    const tagPick = i % 3 === 0 ? "VIP" : i % 3 === 1 ? "Regular" : "New";
    await db.customerTagAssignment.upsert({
      where: { customerId_tagId: { customerId: customer.id, tagId: tags[tagPick].id } },
      create: { customerId: customer.id, tagId: tags[tagPick].id },
      update: {},
    });
  }

  // ---------------- Reviews ----------------
  const reviewSeed = [
    { name: "Sarah M.", rating: 5, text: "Absolutely fantastic food and the staff were so attentive. Best meal we've had in Dubai!" },
    { name: "Mohammed A.", rating: 5, text: "Great ambience and the service was quick. Will be back with the whole family." },
    { name: "Elena P.", rating: 4, text: "Really good food, though the waiting time on a Friday night was a bit long." },
    { name: "James C.", rating: 5, text: "The staff remembered our order from last time. Incredible customer service." },
    { name: "Fatima H.", rating: 3, text: "Food was fine but a bit overpriced for the portion size." },
    { name: "Liam O.", rating: 5, text: "Cleanliness and presentation were spot on. Highly recommend the lamb." },
    { name: "Noor R.", rating: 2, text: "Waited over 40 minutes for our table despite a reservation. Food was good once it arrived." },
    { name: "Carlos D.", rating: 5, text: "Wonderful atmosphere, friendly staff, and the parking was easy to find." },
    { name: "Aisha M.", rating: 4, text: "Lovely experience overall, just wish there was more parking available." },
    { name: "David K.", rating: 5, text: "Consistently great every time we visit. The service team is fantastic." },
    { name: "Layla N.", rating: 1, text: "Very disappointed — the delivery order arrived cold and over an hour late." },
    { name: "Omar S.", rating: 4, text: "Good value, tasty food, staff could be a little friendlier during peak hours." },
    { name: "Priya I.", rating: 5, text: "Best customer service I've experienced. The team went above and beyond." },
    { name: "Yusuf I.", rating: 5, text: "Clean, elegant ambience with excellent food quality every visit." },
    { name: "Grace K.", rating: 3, text: "Decent food but pricing felt high compared to similar restaurants nearby." },
  ];

  const existingReviewCount = await db.review.count({ where: { organizationId: orgA.id } });
  if (existingReviewCount === 0) {
    for (let i = 0; i < reviewSeed.length; i++) {
      const r = reviewSeed[i];
      await db.review.create({
        data: {
          organizationId: orgA.id,
          businessId: businessA.id,
          locationId: i % 3 === 0 ? locAbuDhabi.id : locMarina.id,
          platformId: platforms.GOOGLE.id,
          reviewerName: r.name,
          rating: r.rating,
          content: r.text,
          reviewDate: new Date(Date.now() - (reviewSeed.length - i) * 2 * 24 * 60 * 60 * 1000),
          isMock: true,
        },
      });
    }
  }

  // ---------------- Review requests ----------------
  const requestStatuses = ["SENT", "DELIVERED", "OPENED", "CLICKED", "COMPLETED", "PENDING"] as const;
  const existingRequestCount = await db.reviewRequest.count({ where: { organizationId: orgA.id } });
  if (existingRequestCount === 0) {
    for (let i = 0; i < customers.length; i++) {
      const status = requestStatuses[i % requestStatuses.length];
      const c = customers[i];
      await db.reviewRequest.create({
        data: {
          organizationId: orgA.id,
          businessId: businessA.id,
          customerId: c.id,
          platformId: platforms.GOOGLE.id,
          channel: i % 3 === 0 ? "SMS" : "EMAIL",
          status,
          message: renderTemplate(DEFAULT_REQUEST_TEMPLATE, {
            customer_name: c.firstName,
            business_name: "ABC Restaurant",
            review_link: "https://reviewengine.app/r/demo",
          }),
          sentAt: status !== "PENDING" ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : null,
          deliveredAt: ["DELIVERED", "OPENED", "CLICKED", "COMPLETED"].includes(status) ? new Date() : null,
          openedAt: ["OPENED", "CLICKED", "COMPLETED"].includes(status) ? new Date() : null,
          clickedAt: ["CLICKED", "COMPLETED"].includes(status) ? new Date() : null,
          completedAt: status === "COMPLETED" ? new Date() : null,
        },
      });
    }
  }

  // ---------------- Campaign ----------------
  let campaign = await db.campaign.findFirst({ where: { organizationId: orgA.id, name: "Post-Purchase Review Campaign" } });
  if (!campaign) {
    campaign = await db.campaign.create({
      data: {
        organizationId: orgA.id,
        businessId: businessA.id,
        name: "Post-Purchase Review Campaign",
        description: "Automatically requests a review after every visit, with two gentle reminders.",
        channel: "EMAIL",
        status: "RUNNING",
        audience: { status: ["NEW", "CONTACTED"] },
        steps: {
          create: [
            { order: 0, dayOffset: 0, type: "SEND_REQUEST", messageTemplate: DEFAULT_REQUEST_TEMPLATE },
            { order: 1, dayOffset: 3, type: "REMINDER", messageTemplate: DEFAULT_REMINDER_TEMPLATE },
            { order: 2, dayOffset: 7, type: "REMINDER", messageTemplate: DEFAULT_REMINDER_TEMPLATE },
          ],
        },
      },
    });
    for (const c of customers.slice(0, 6)) {
      await db.campaignEnrollment.create({
        data: { campaignId: campaign.id, customerId: c.id, status: "IN_PROGRESS", currentStepIndex: 1, nextRunAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      });
    }
  }

  // ---------------- Automation ----------------
  let automation = await db.automation.findFirst({ where: { organizationId: orgA.id, name: "New Customer Follow-up" } });
  if (!automation) {
    const nodeDefs = [
      { key: "trigger", type: "TRIGGER" as const, label: "Customer Added", x: 0, y: 0 },
      { key: "wait1", type: "WAIT" as const, label: "Wait 1 Day", x: 0, y: 140, config: { days: 1 } },
      { key: "send", type: "SEND_REQUEST" as const, label: "Send Review Request", x: 0, y: 280, config: { channel: "EMAIL" } },
      { key: "wait3", type: "WAIT" as const, label: "Wait 3 Days", x: 0, y: 420, config: { days: 3 } },
      { key: "cond", type: "CONDITION" as const, label: "Review Completed?", x: 0, y: 560 },
      { key: "stop", type: "STOP" as const, label: "Stop", x: -160, y: 700 },
      { key: "remind", type: "SEND_REMINDER" as const, label: "Send Reminder", x: 160, y: 700, config: { channel: "EMAIL" } },
    ];
    const createdAutomation = await db.automation.create({
      data: {
        organizationId: orgA.id,
        businessId: businessA.id,
        name: "New Customer Follow-up",
        status: "ACTIVE",
        triggerType: "CUSTOMER_ADDED",
        edges: [],
        nodes: { create: nodeDefs.map((n) => ({ type: n.type, label: n.label, positionX: n.x, positionY: n.y, config: n.config ?? {} })) },
      },
      include: { nodes: true },
    });
    automation = createdAutomation;
    const idOf = (key: string) => createdAutomation.nodes.find((n) => n.label === nodeDefs.find((d) => d.key === key)?.label)!.id;
    const edges = [
      { id: "e1", source: idOf("trigger"), target: idOf("wait1") },
      { id: "e2", source: idOf("wait1"), target: idOf("send") },
      { id: "e3", source: idOf("send"), target: idOf("wait3") },
      { id: "e4", source: idOf("wait3"), target: idOf("cond") },
      { id: "e5", source: idOf("cond"), target: idOf("stop"), sourceHandle: "yes" },
      { id: "e6", source: idOf("cond"), target: idOf("remind"), sourceHandle: "no" },
    ];
    await db.automation.update({ where: { id: automation.id }, data: { edges } });
  }

  // ---------------- Analytics snapshots (last 30 days) ----------------
  const snapshotCount = await db.analyticsSnapshot.count({ where: { organizationId: orgA.id } });
  if (snapshotCount === 0) {
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - d);
      const progress = (29 - d) / 29;
      await db.analyticsSnapshot.create({
        data: {
          organizationId: orgA.id,
          businessId: businessA.id,
          date,
          totalReviews: Math.round(4500 + progress * 340),
          averageRating: Number((4.5 + progress * 0.2).toFixed(2)),
          reviewsThisPeriod: Math.round(6 + Math.random() * 12),
          requestsSent: Math.round(200 + Math.random() * 80),
          requestsDelivered: Math.round(180 + Math.random() * 70),
          requestsOpened: Math.round(120 + Math.random() * 60),
          requestsClicked: Math.round(90 + Math.random() * 40),
          requestsCompleted: Math.round(70 + Math.random() * 35),
          ratingDistribution: { five: 84, four: 10, three: 3, two: 1, one: 2 },
        },
      });
    }
  }

  // ---------------- Notifications / audit / api key ----------------
  await db.notification.createMany({
    data: [
      { organizationId: orgA.id, type: "NEW_REVIEW", title: "New 5★ review", body: "Sarah M. just left a 5-star review on Google.", isRead: false },
      { organizationId: orgA.id, type: "CAMPAIGN_COMPLETED", title: "Campaign completed", body: "Post-Purchase Review Campaign finished a run for 6 customers.", isRead: true },
      { organizationId: orgA.id, type: "RATING_CHANGE", title: "Rating increased", body: "Your average rating rose from 4.5 to 4.7 over the last 90 days.", isRead: false },
    ],
    skipDuplicates: true,
  });

  await db.auditLog.create({
    data: { organizationId: orgA.id, userId: ownerA.id, action: "ORGANIZATION_CREATED", resourceType: "Organization", resourceId: orgA.id, result: "SUCCESS" },
  });

  // ---------------- Org B: minimal, for tenant-isolation verification ----------------
  const ownerB = await db.user.upsert({
    where: { email: "owner@skylinerealty.com" },
    create: { email: "owner@skylinerealty.com", name: "Tariq Hassan", passwordHash: await hash("Password123!"), emailVerified: new Date() },
    update: {},
  });
  const orgB = await db.organization.upsert({
    where: { slug: "skyline-realty" },
    create: { name: "Skyline Realty Group", slug: "skyline-realty", industry: "Real Estate" },
    update: {},
  });
  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: orgB.id, userId: ownerB.id } },
    create: { organizationId: orgB.id, userId: ownerB.id, role: "OWNER", status: "ACTIVE" },
    update: {},
  });
  await db.subscription.upsert({
    where: { organizationId: orgB.id },
    create: { organizationId: orgB.id, planId: plans.FREE.id, status: "ACTIVE" },
    update: {},
  });
  let businessB = await db.business.findFirst({ where: { organizationId: orgB.id } });
  if (!businessB) {
    businessB = await db.business.create({
      data: { organizationId: orgB.id, name: "Skyline Realty Group", industry: "Real Estate", googlePlaceId: "mock-skyline-realty" },
    });
    await db.businessLocation.create({ data: { businessId: businessB.id, name: "Business Bay HQ", city: "Dubai", country: "UAE", isPrimary: true } });
    await db.customer.create({
      data: { organizationId: orgB.id, businessId: businessB.id, firstName: "Reem", lastName: "Al Suwaidi", email: "reem@example.com", status: "NEW" },
    });
  }

  console.log("Seed complete.");
  console.log("  Super admin:  admin@reviewengine.app / Admin123!  -> /admin");
  console.log("  Org A owner:  owner@abcrestaurant.com / Password123!  -> ABC Restaurant Group");
  console.log("  Org B owner:  owner@skylinerealty.com / Password123!  -> Skyline Realty Group (isolation check)");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
