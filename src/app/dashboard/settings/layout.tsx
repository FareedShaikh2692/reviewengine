import { SettingsTabs } from "@/components/dashboard/settings/settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Settings</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your profile, business, integrations, and billing.</p>
      </div>
      <SettingsTabs />
      <div>{children}</div>
    </div>
  );
}
