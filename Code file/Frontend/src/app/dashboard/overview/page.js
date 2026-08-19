import { getWeatherDashboardData } from "@/lib/weather";
import { getRouteComparison } from "@/lib/routes";

function computeOperationalRiskScore(weather, recommendedRoute) {
  let score = 0;

  const airQuality = Number(weather?.current?.airQuality || 0);
  const wind = parseInt(weather?.current?.wind || "0", 10);
  const visibility = parseInt(weather?.current?.visibility || "0", 10);

  if (airQuality >= 150) score += 20;
  else if (airQuality >= 100) score += 10;

  if (wind >= 40) score += 25;
  else if (wind >= 20) score += 10;

  if (visibility <= 5) score += 20;
  else if (visibility <= 10) score += 10;

  if (recommendedRoute?.weatherRiskScore) {
    score += Math.round(recommendedRoute.weatherRiskScore * 0.4);
  }

  return Math.min(score, 100);
}

function scoreLabel(score) {
  if (score < 20) return "Low";
  if (score < 45) return "Moderate";
  if (score < 70) return "High";
  return "Critical";
}

export default async function OverviewPage({ searchParams }) {
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

  const recommendedRoute =
    routeData?.routes?.find((route) => route.recommended) || null;

  const operationalRisk = computeOperationalRiskScore(weather, recommendedRoute);

  const overviewCards = [
    {
      label: "Current temp",
      value: `${weather.current.temp}°`,
      sub: weather.current.condition,
    },
    {
      label: "Air quality",
      value: weather.current.airQuality,
      sub: "Live AQI",
    },
    {
      label: "Wind",
      value: weather.current.wind,
      sub: "Live wind speed",
    },
    {
      label: "Visibility",
      value: weather.current.visibility,
      sub: "Current visibility",
    },
    {
      label: "Operational risk",
      value: operationalRisk,
      sub: scoreLabel(operationalRisk),
    },
    {
      label: "Recommended ETA",
      value: recommendedRoute
        ? `${recommendedRoute.etaWithDelayMinutes} min`
        : "—",
      sub: recommendedRoute ? recommendedRoute.label : "Set route inputs",
    },
    {
      label: "Predicted delay",
      value: recommendedRoute
        ? `+${recommendedRoute.predictedDelayMinutes} min`
        : "—",
      sub: recommendedRoute
        ? recommendedRoute.weatherRiskCategory
        : "No route selected",
    },
    {
      label: "Best route",
      value: recommendedRoute ? recommendedRoute.label : "—",
      sub: recommendedRoute
        ? `${recommendedRoute.distanceKm} km`
        : "Set origin & destination",
    },
  ];

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const pageTitleColor = isLight ? "#17345f" : "var(--surface-text-primary)";
  const pageSubColor = isLight ? "#5e7298" : "var(--surface-text-secondary)";

  const cardBackground = isLight ? "#ffffff" : "#243b6d";
const cardBorder = isLight
  ? "1px solid rgba(24, 61, 122, 0.10)"
  : "1px solid rgba(255,255,255,0.08)";
const cardShadow = isLight
  ? "0 10px 24px rgba(16, 38, 79, 0.06)"
  : "0 10px 24px rgba(0, 0, 0, 0.14)";


  const cardLabelColor = isLight ? "#4f6791" : "var(--card-text-secondary)";
  const cardValueColor = isLight ? "#17345f" : "var(--card-text-primary)";
  const cardSubColor = isLight ? "#6f83a8" : "var(--card-text-muted)";

  return (
    <div
      style={{
        background: pageBackground,
        color: pageTitleColor,
        padding: 18,
        borderRadius: 24,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: pageTitleColor,
        }}
      >
        Operational overview
      </div>

      <div
        style={{
          marginTop: 6,
          color: pageSubColor,
          fontSize: 14,
        }}
      >
        Live logistics and weather context for {weather.location}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        {overviewCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: cardBackground,
              border: cardBorder,
              boxShadow: cardShadow,
              borderRadius: 22,
              padding: 22,
              minHeight: 140,
              boxSizing: "border-box",
              color: cardValueColor,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: cardValueColor,
              }}
            >
              {card.label}
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 27,
                fontWeight: 700,
                lineHeight: 1.05,
                color: cardValueColor,
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                marginTop: 14,
                color: cardLabelColor,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {card.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
