import { getSessionUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import { ProfileSettingsForm } from "@/components/dashboard/settings/profile-form";

export default async function ProfileSettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  return <ProfileSettingsForm user={{ name: user.name ?? "", email: user.email, phone: user.phone ?? "" }} />;
}
