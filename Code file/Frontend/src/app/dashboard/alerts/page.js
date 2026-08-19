import RouteSearchForm from "@/components/route-intelligence/RouteSearchForm";
import { getWeatherDashboardData } from "@/lib/weather";
import { getRouteComparison } from "@/lib/routes";
import { getEmissionsEstimate } from "@/lib/emissions";

function toNumberFromText(value) {
  if (value == null) return 0;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function normalizeSeverity(value) {
  const normalized = String(value || "").trim().toLowerCase();

  if (normalized === "critical") return "Critical";
  if (normalized === "high") return "High";
  if (normalized === "moderate") return "Moderate";
  if (normalized === "low") return "Low";

  return "Moderate";
}

function buildAlerts({ weather, routeData, emissionsData }) {
  const alerts = [];

  const current = weather?.current || {};
  const airQuality = Number(current.airQuality || 0);
  const wind = toNumberFromText(current.wind);
  const visibility = toNumberFromText(current.visibility);
  const uv = Number(current.uvIndex || 0);

  if (airQuality >= 150) {
    alerts.push({
      title: "Air quality alert",
      severity: "High",
      description: `AQI is ${airQuality}, which may affect field operations and personnel exposure.`,
      source: "Live AQI",
    });
  } else if (airQuality >= 100) {
    alerts.push({
      title: "Air quality watch",
      severity: "Moderate",
      description: `AQI is ${airQuality}. Environmental operating conditions should be monitored.`,
      source: "Live AQI",
    });
  }

  if (wind >= 40) {
    alerts.push({
      title: "High wind alert",
      severity: "High",
      description: `Wind speed is ${current.wind}. Exposed corridors may face delivery disruption.`,
      source: "Live weather",
    });
  } else if (wind >= 20) {
    alerts.push({
      title: "Wind advisory",
      severity: "Moderate",
      description: `Wind speed is ${current.wind}. Route stability should be monitored.`,
      source: "Live weather",
    });
  }

  if (visibility > 0 && visibility <= 5) {
    alerts.push({
      title: "Low visibility alert",
      severity: "Critical",
      description: `Visibility is ${current.visibility}. Dispatch and ETA safety assumptions may be invalid.`,
      source: "Live weather",
    });
  } else if (visibility > 0 && visibility <= 10) {
    alerts.push({
      title: "Reduced visibility advisory",
      severity: "Moderate",
      description: `Visibility is ${current.visibility}. Delivery delays may increase.`,
      source: "Live weather",
    });
  }

  if (uv >= 10) {
    alerts.push({
      title: "Environmental exposure alert",
      severity: "Moderate",
      description: `UV index is ${uv}. Outdoor workforce exposure should be reviewed.`,
      source: "Live weather",
    });
  }

  const recommendedRoute =
    routeData?.routes?.find((route) => route.recommended) || null;

  if (recommendedRoute) {
    if (recommendedRoute.weatherRiskScore >= 70) {
      alerts.push({
        title: "Route risk critical",
        severity: "Critical",
        description: `${recommendedRoute.label} carries a weather risk score of ${recommendedRoute.weatherRiskScore} with predicted delay +${recommendedRoute.predictedDelayMinutes} min.`,
        source: "Route intelligence",
      });
    } else if (recommendedRoute.weatherRiskScore >= 45) {
      alerts.push({
        title: "Route risk elevated",
        severity: "High",
        description: `${recommendedRoute.label} carries elevated weather risk (${recommendedRoute.weatherRiskCategory}).`,
        source: "Route intelligence",
      });
    }

    const liveDelay = Number(recommendedRoute.predictedDelayMinutes || 0);

    if (liveDelay > 0) {
      alerts.push({
        title: "Delay alert",
        severity: normalizeSeverity(recommendedRoute.weatherRiskCategory),
        description: `Predicted route delay is +${liveDelay} min on ${recommendedRoute.label}.`,
        source: "Prediction signal",
      });
    }
  }

  if (emissionsData?.thresholdExceeded) {
    alerts.push({
      title: "Emission threshold exceeded",
      severity: normalizeSeverity(emissionsData.alertLevel || "High"),
      description: `Estimated CO₂ is ${emissionsData.estimatedCo2Kg} kg for the recommended route.`,
      source: "Sustainability engine",
    });
  }

  if (!alerts.length) {
    alerts.push({
      title: "No active alerts",
      severity: "Low",
      description:
        "Current live signals do not exceed the configured operational alert thresholds.",
      source: "System status",
    });
  }

  return alerts;
}

function severityStyle(severity) {
  if (severity === "Critical") {
    return { bg: "#ff6b6b", text: "#102553" };
  }
  if (severity === "High") {
    return { bg: "#ffb347", text: "#102553" };
  }
  if (severity === "Moderate") {
    return { bg: "#74b7ff", text: "#102553" };
  }
  return { bg: "#57d37a", text: "#102553" };
}

export default async function AlertsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const city =
    typeof resolvedSearchParams?.city === "string"
      ? resolvedSearchParams.city.trim()
      : "Bengaluru";

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

  const weather = await getWeatherDashboardData(city);

  let routeData = null;
  try {
    if (origin && destination) {
      routeData = await getRouteComparison(origin, destination);
    }
  } catch {
    routeData = null;
  }

  let emissionsData = null;
  try {
    const readyForEmissions =
      origin &&
      destination &&
      vehicleType &&
      fuelType &&
      Number.isFinite(consumptionPerKm) &&
      consumptionPerKm > 0;

    if (readyForEmissions) {
      emissionsData = await getEmissionsEstimate({
        origin,
        destination,
        vehicleType,
        fuelType,
        consumptionPerKm,
        loadFactor: Number.isFinite(loadFactor) ? loadFactor : 1.0,
      });
    }
  } catch {
    emissionsData = null;
  }

  const alerts = buildAlerts({ weather, routeData, emissionsData });

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const pageTitleColor = isLight ? "#17345f" : "var(--text-primary)";
  const pageSubColor = isLight ? "#5e7298" : "var(--text-secondary)";

  const cardBackground = isLight ? "#ffffff" : "#2a3b66";
const cardBorder = isLight
  ? "1px solid rgba(24, 61, 122, 0.10)"
  : "1px solid rgba(255,255,255,0.08)";
const cardShadow = isLight
  ? "0 10px 24px rgba(16, 38, 79, 0.06)"
  : "0 10px 24px rgba(0, 0, 0, 0.14)";

  const cardTitleColor = isLight ? "#17345f" : "var(--text-primary)";
  const cardDescColor = isLight ? "#4f6791" : "var(--text-secondary)";
  const cardSourceColor = isLight ? "#6f83a8" : "var(--text-muted)";

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
        Alerts
      </div>

      <div
        style={{
          marginTop: 6,
          color: pageSubColor,
          fontSize: 14,
        }}
      >
        Live operational, route, and sustainability alerts
      </div>

      <RouteSearchForm />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        {alerts.map((alert, index) => {
          const style = severityStyle(alert.severity);

          return (
            <div
              key={`${alert.title}-${index}`}
              style={{
                background: cardBackground,
                border: cardBorder,
                boxShadow: cardShadow,
                borderRadius: 22,
                padding: 22,
                color: cardTitleColor,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: cardTitleColor,
                  }}
                >
                  {alert.title}
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: style.bg,
                    color: style.text,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {alert.severity}
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  color: cardDescColor,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {alert.description}
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: cardSourceColor,
                }}
              >
                Source: {alert.source}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}