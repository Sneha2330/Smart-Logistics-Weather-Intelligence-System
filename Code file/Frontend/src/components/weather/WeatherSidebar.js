"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./weather.module.css";

const items = [
  { label: "Home", href: "/dashboard/weather-risk" },
  { label: "Overview", href: "/dashboard/overview" },
  { label: "Route Intelligence", href: "/dashboard/route-intelligence" },
  { label: "Prediction Analysis", href: "/dashboard/prediction-analysis" },
  { label: "Sustainability", href: "/dashboard/sustainability" },
  { label: "Alerts", href: "/dashboard/alerts" },
  { label: "Recommendations", href: "/dashboard/recommendations" },
];

export default function WeatherSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className={styles.sidebar}>
      {items.map((item) => {
        const active =
          item.href === "/dashboard/weather-risk"
            ? pathname === item.href
            : pathname.startsWith(item.href);

        const query = searchParams.toString();
        const href = query ? `${item.href}?${query}` : item.href;

        return (
          <Link
            key={item.href}
            href={href}
            className={`${styles.sidebarItem} ${
              active ? styles.sidebarItemActive : ""
            }`}
          >
            <span className={styles.sidebarLabel}>{item.label}</span>
          </Link>
        );
      })}
    </aside>
  );
}
