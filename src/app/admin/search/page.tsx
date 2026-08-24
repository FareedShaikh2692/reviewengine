import { AdminSearchBox } from "@/components/admin/admin-search-box";

export default function AdminSearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Platform search</h1>
        <p className="mt-1 text-sm text-ink-500">Search businesses, users, customers, and campaigns across every tenant.</p>
      </div>
      <AdminSearchBox />
    </div>
  );
}
