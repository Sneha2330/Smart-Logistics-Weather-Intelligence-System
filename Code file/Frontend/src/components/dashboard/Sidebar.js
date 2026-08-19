"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Truck,
  CloudSun,
  Route,
  Leaf,
  Bell,
  BarChart3,
  Settings,
} from "lucide-react";

const items = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Shipments", href: "/dashboard/shipments", icon: Truck },
  { label: "Weather Risk", href: "/dashboard/weather-risk", icon: CloudSun },
  { label: "Route Intelligence", href: "/dashboard/route-intelligence", icon: Route },
  { label: "Sustainability", href: "/dashboard/sustainability", icon: Leaf },
  { label: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar({ stats = {} }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <div>
          <h1 className="text-lg font-semibold">Smart Logistics</h1>
          <p className="text-xs text-gray-500">Operational Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            let badgeValue = null;
            if (item.label === "Shipments") badgeValue = stats.shipments;
            if (item.label === "Alerts") badgeValue = stats.alerts;
            if (item.label === "Weather Risk") badgeValue = stats.weatherRisk;

            return (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm transition ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </div>

                  {badgeValue !== null ? (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        active
                          ? "bg-white/20 text-white"
                          : "bg-zinc-200 text-zinc-800"
                      }`}
                    >
                      {badgeValue}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t p-4">
        <div className="rounded-xl bg-zinc-100 p-4">
          <p className="text-xs text-gray-500">System Status</p>
          <p className="mt-1 text-sm font-medium text-green-600">
            Backend Connected
          </p>
        </div>
      </div>
    </aside>
  );
}