"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import styles from "./weather.module.css";

export default function LocationSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCity = searchParams.get("city") || "Bengaluru";
  const currentTheme = searchParams.get("theme") || "dark";

  function updateParams(nextValues) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(nextValues).forEach(([key, value]) => {
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const cityValue = String(form.get("city") || "").trim();

    updateParams({
      city: cityValue || "Bengaluru",
    });
  }

  function toggleTheme() {
    updateParams({
      theme: currentTheme === "dark" ? "light" : "dark",
    });
  }

  return (
    <header className={styles.weatherHeader}>
      <div className={styles.headerLeft}>
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <input
            name="city"
            className={styles.searchInput}
            placeholder="Search for location"
            defaultValue={currentCity}
            aria-label="Search city"
          />
          <button type="submit" className={styles.submitBtn}>
            Search
          </button>
        </form>
      </div>

      <div className={styles.headerRight}>
        <button
          type="button"
          className={styles.headerBtn}
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {currentTheme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}