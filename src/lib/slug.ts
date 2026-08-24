import { db } from "@/lib/db";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 48);
}

export async function uniqueOrgSlug(base: string): Promise<string> {
  const root = slugify(base) || "business";
  let candidate = root;
  let suffix = 1;
  while (await db.organization.findUnique({ where: { slug: candidate } })) {
    suffix += 1;
    candidate = `${root}-${suffix}`;
  }
  return candidate;
}
