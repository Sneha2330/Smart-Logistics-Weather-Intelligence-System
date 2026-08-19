"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RouteSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");

  const city = searchParams.get("city") || "";
  const theme = searchParams.get("theme") || "dark";
  const isLight = theme === "light";

  function handleSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (city) params.set("city", city);
    if (origin.trim()) params.set("origin", origin.trim());
    else params.delete("origin");

    if (destination.trim()) params.set("destination", destination.trim());
    else params.delete("destination");

    router.push(`${pathname}?${params.toString()}`);
  }

  const inputBackground = isLight ? "#ffffff" : "rgba(255,255,255,0.08)";
  const inputBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid rgba(255,255,255,0.12)";
  const inputText = isLight ? "#17345f" : "#ffffff";

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginTop: 20,
        marginBottom: 20,
      }}
    >
      <input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="Origin (e.g. Bengaluru)"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          minWidth: 240,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destination (e.g. Mysuru)"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          minWidth: 240,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <button
        type="submit"
        style={{
          padding: "14px 20px",
          borderRadius: 16,
          background: "#f4cd2f",
          color: "#19284d",
          border: "none",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
        }}
      >
        Compare routes
      </button>
    </form>
  );
}