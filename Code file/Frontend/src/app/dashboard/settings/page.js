"use client";

import SectionCard from "@/components/dashboard/SectionCard";

export default function SettingsPage() {
  return (
    <div className="w-full min-w-0">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-semibold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage refresh interval, API preferences, notifications, and theme options.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard title="General">
            <p className="text-sm text-gray-600">
              Add refresh interval, location defaults, and timezone settings here.
            </p>
          </SectionCard>

          <SectionCard title="Notifications">
            <p className="text-sm text-gray-600">
              Configure alert thresholds and notification preferences.
            </p>
          </SectionCard>

          <SectionCard title="API Preferences">
            <p className="text-sm text-gray-600">
              Set weather API provider, fallback source, and caching strategy.
            </p>
          </SectionCard>

          <SectionCard title="Theme">
            <p className="text-sm text-gray-600">
              Choose between light, dark, and system themes.
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
