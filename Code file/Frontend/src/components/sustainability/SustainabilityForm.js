"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SustainabilityForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") || ""
  );
  const [vehicleType, setVehicleType] = useState(
    searchParams.get("vehicleType") || "truck"
  );
  const [fuelType, setFuelType] = useState(
    searchParams.get("fuelType") || "diesel"
  );
  const [consumptionPerKm, setConsumptionPerKm] = useState(
    searchParams.get("consumptionPerKm") || "0.25"
  );
  const [loadFactor, setLoadFactor] = useState(
    searchParams.get("loadFactor") || "1.0"
  );

  const city = searchParams.get("city") || "";
  const theme = searchParams.get("theme") || "dark";
  const isLight = theme === "light";

  function handleSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams(searchParams.toString());

    if (city) params.set("city", city);
    if (origin.trim()) params.set("origin", origin.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (vehicleType.trim()) params.set("vehicleType", vehicleType.trim());
    if (fuelType.trim()) params.set("fuelType", fuelType.trim());
    if (consumptionPerKm) params.set("consumptionPerKm", consumptionPerKm);
    if (loadFactor) params.set("loadFactor", loadFactor);

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
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 12,
        marginTop: 20,
        marginBottom: 24,
      }}
    >
      <input
        value={origin}
        onChange={(e) => setOrigin(e.target.value)}
        placeholder="Origin"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        placeholder="Destination"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={vehicleType}
        onChange={(e) => setVehicleType(e.target.value)}
        placeholder="Vehicle type"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={fuelType}
        onChange={(e) => setFuelType(e.target.value)}
        placeholder="Fuel type"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={consumptionPerKm}
        onChange={(e) => setConsumptionPerKm(e.target.value)}
        placeholder="Consumption per km"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
          fontSize: 15,
          fontWeight: 560,
          outline: "none",
        }}
      />

      <input
        value={loadFactor}
        onChange={(e) => setLoadFactor(e.target.value)}
        placeholder="Load factor"
        style={{
          padding: "14px 18px",
          borderRadius: 16,
          border: inputBorder,
          background: inputBackground,
          color: inputText,
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
          gridColumn: "span 3",
        }}
      >
        Calculate sustainability
      </button>
    </form>
  );
}