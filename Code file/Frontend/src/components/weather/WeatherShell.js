"use client";

import { useSearchParams } from "next/navigation";
import LocationSearch from "./LocationSearch";
import WeatherSidebar from "./WeatherSidebar";
import styles from "./weather.module.css";

export default function WeatherShell({ children }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "dark";

  return (
    <div className={theme === "light" ? styles.pageLight : styles.page}>
      <LocationSearch />
      <div className={styles.body}>
        <WeatherSidebar />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}