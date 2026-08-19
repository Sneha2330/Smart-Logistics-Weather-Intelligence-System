"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";

export default function DashboardFrame({ children }) {
  const pathname = usePathname();
  const isWeatherRisk = pathname.startsWith("/dashboard/weather-risk");

  if (isWeatherRisk) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        <TopHeader />
        {children}
      </div>
    </div>
  );
}