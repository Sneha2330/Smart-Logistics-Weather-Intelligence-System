"use client";

import { usePathname } from "next/navigation";
import DashboardFrame from "@/components/dashboard/DashboardFrame";
import WeatherShell from "@/components/weather/WeatherShell";

const shellPaths = [
  "/dashboard/weather-risk",
  "/dashboard/overview",
  "/dashboard/route-intelligence",
  "/dashboard/prediction-analysis",
  "/dashboard/sustainability",
  "/dashboard/alerts",
  "/dashboard/recommendations",
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const useBusinessShell = shellPaths.some((path) => pathname.startsWith(path));

  // weather-risk already has its own nested layout
  if (pathname.startsWith("/dashboard/weather-risk")) {
    return <>{children}</>;
  }

  if (useBusinessShell) {
    return <WeatherShell>{children}</WeatherShell>;
  }

  return <DashboardFrame>{children}</DashboardFrame>;
}