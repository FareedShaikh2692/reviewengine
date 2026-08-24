import { getSessionUser } from "@/lib/tenant";
import { db } from "@/lib/db";
import { NotificationPreferencesForm } from "@/components/dashboard/settings/notification-preferences-form";

export default async function NotificationSettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;
  const user = await db.user.findUniqueOrThrow({ where: { id: sessionUser.id } });

  const prefs = (user.notificationPreferences as Record<string, boolean>) ?? {
    email: true,
    newReview: true,
    campaignActivity: true,
    productUpdates: false,
  };

  return <NotificationPreferencesForm prefs={prefs} />;
}
