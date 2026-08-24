import "dotenv/config";
import { db } from "../src/lib/db";
import { PLAN_DEFS, PLATFORM_DEFS } from "./seed-data";

/**
 * Production-safe seed: only the reference/catalog data the app needs to function
 * (billing plans, review platform list). No demo orgs, customers, or accounts.
 */
async function main() {
  console.log("Seeding catalog data (plans + review platforms)...");

  for (const p of PLAN_DEFS) {
    await db.plan.upsert({
      where: { key: p.key },
      create: p,
      update: { name: p.name, priceMonthly: p.priceMonthly, priceYearly: p.priceYearly, limits: p.limits, features: p.features },
    });
  }

  for (const p of PLATFORM_DEFS) {
    await db.reviewPlatform.upsert({
      where: { key: p.key },
      create: p,
      update: { name: p.name, reviewUrlTemplate: p.reviewUrlTemplate },
    });
  }

  console.log(`Seeded ${PLAN_DEFS.length} plans and ${PLATFORM_DEFS.length} review platforms.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
