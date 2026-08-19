import SustainabilityForm from "@/components/sustainability/SustainabilityForm";
import { getEmissionsEstimate } from "@/lib/emissions";

export default async function SustainabilityPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const origin =
    typeof resolvedSearchParams?.origin === "string"
      ? resolvedSearchParams.origin.trim()
      : "";

  const destination =
    typeof resolvedSearchParams?.destination === "string"
      ? resolvedSearchParams.destination.trim()
      : "";

  const vehicleType =
    typeof resolvedSearchParams?.vehicleType === "string"
      ? resolvedSearchParams.vehicleType.trim()
      : "";

  const fuelType =
    typeof resolvedSearchParams?.fuelType === "string"
      ? resolvedSearchParams.fuelType.trim()
      : "";

  const consumptionPerKm =
    typeof resolvedSearchParams?.consumptionPerKm === "string"
      ? parseFloat(resolvedSearchParams.consumptionPerKm)
      : NaN;

  const loadFactor =
    typeof resolvedSearchParams?.loadFactor === "string"
      ? parseFloat(resolvedSearchParams.loadFactor)
      : 1.0;

  const theme =
    typeof resolvedSearchParams?.theme === "string"
      ? resolvedSearchParams.theme.trim()
      : "dark";

  const isLight = theme === "light";

  let data = null;
  let error = null;

  const ready =
    origin &&
    destination &&
    vehicleType &&
    fuelType &&
    Number.isFinite(consumptionPerKm) &&
    consumptionPerKm > 0;

  if (ready) {
    try {
      data = await getEmissionsEstimate({
        origin,
        destination,
        vehicleType,
        fuelType,
        consumptionPerKm,
        loadFactor: Number.isFinite(loadFactor) ? loadFactor : 1.0,
      });
    } catch (err) {
      error = String(err.message || err);
    }
  }

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const pageTitleColor = isLight ? "#17345f" : "var(--text-primary)";
  const pageSubColor = isLight ? "#5e7298" : "var(--text-secondary)";

  const infoCardBackground = isLight ? "#ffffff" : "#2a3b66";
const infoCardAltBackground = isLight ? "#ffffff" : "#31467a";
const infoCardBorder = isLight
  ? "1px solid rgba(24, 61, 122, 0.10)"
  : "1px solid rgba(255,255,255,0.08)";
const infoCardShadow = isLight
  ? "0 10px 24px rgba(16, 38, 79, 0.06)"
  : "0 10px 24px rgba(0, 0, 0, 0.14)";

  const cardLabelColor = isLight ? "#4f6791" : "var(--text-secondary)";
  const cardValueColor = isLight ? "#17345f" : "var(--text-primary)";
  const cardSubColor = isLight ? "#6f83a8" : "var(--text-muted)";

  const errorBackground = isLight
    ? "rgba(255, 179, 71, 0.16)"
    : "var(--error-bg)";
  const errorText = isLight ? "#17345f" : "var(--text-primary)";

  return (
    <div
      style={{
        background: pageBackground,
        color: pageTitleColor,
        padding: 18,
        borderRadius: 24,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: pageTitleColor }}>
        Sustainability
      </div>

      <div
        style={{
          marginTop: 6,
          color: pageSubColor,
          fontSize: 14,
        }}
      >
        Live route-based environmental impact and fuel/energy tracking
      </div>

      <SustainabilityForm />

      {error ? (
        <div
          style={{
            marginTop: 20,
            background: errorBackground,
            color: errorText,
            padding: 16,
            borderRadius: 16,
          }}
        >
          Sustainability service is temporarily unavailable: {error}
        </div>
      ) : null}

      {!ready ? (
        <div
          style={{
            marginTop: 20,
            background: infoCardBackground,
            border: infoCardBorder,
            boxShadow: infoCardShadow,
            borderRadius: 22,
            padding: 20,
            color: cardLabelColor,
          }}
        >
          Enter origin, destination, vehicle type, fuel type, and consumption
          rate to compute live route-based emissions.
        </div>
      ) : null}

      {data ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 18,
            marginTop: 24,
          }}
        >
          <div
            style={{
              background: infoCardBackground,
              border: infoCardBorder,
              boxShadow: infoCardShadow,
              borderRadius: 22,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: cardLabelColor }}>
              Recommended route
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 700,
                color: cardValueColor,
              }}
            >
              {data.recommendedRoute.label}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: cardSubColor,
              }}
            >
              {data.recommendedRoute.distanceKm} km ·{" "}
              {data.recommendedRoute.etaWithDelayMinutes} min
            </div>
          </div>

          <div
            style={{
              background: infoCardAltBackground,
              border: infoCardBorder,
              boxShadow: infoCardShadow,
              borderRadius: 22,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: cardLabelColor }}>
              Estimated usage
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 700,
                color: cardValueColor,
              }}
            >
              {data.estimatedUsage} {data.usageUnit}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: cardSubColor,
              }}
            >
              {data.fuelType} · {data.vehicleType}
            </div>
          </div>

          <div
            style={{
              background: infoCardBackground,
              border: infoCardBorder,
              boxShadow: infoCardShadow,
              borderRadius: 22,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: cardLabelColor }}>
              Estimated CO₂
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 700,
                color: cardValueColor,
              }}
            >
              {data.estimatedCo2Kg} kg
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: cardSubColor,
              }}
            >
              Alert level: {data.alertLevel}
            </div>
          </div>

          <div
            style={{
              background: infoCardAltBackground,
              border: infoCardBorder,
              boxShadow: infoCardShadow,
              borderRadius: 22,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 13, color: cardLabelColor }}>
              Sustainability score
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 700,
                color: cardValueColor,
              }}
            >
              {data.sustainabilityScore}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 13,
                color: cardSubColor,
              }}
            >
              {data.thresholdExceeded
                ? "Threshold exceeded"
                : "Within threshold"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
