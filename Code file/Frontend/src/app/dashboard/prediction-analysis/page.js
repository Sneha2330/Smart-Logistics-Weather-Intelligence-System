import { getWeatherDashboardData } from "@/lib/weather";
import { getRouteComparison } from "@/lib/routes";
import RouteSearchForm from "@/components/route-intelligence/RouteSearchForm";

function probabilityLabel(score) {
  if (score < 20) return "Low";
  if (score < 45) return "Moderate";
  if (score < 70) return "High";
  return "Critical";
}

function buildPrediction(weather, recommendedRoute) {
  const airQuality = Number(weather?.current?.airQuality || 0);
  const wind = parseInt(weather?.current?.wind || "0", 10);
  const visibility = parseInt(weather?.current?.visibility || "0", 10);

  let baseScore = 0;
  const reasons = [];

  if (airQuality >= 150) {
    baseScore += 15;
    reasons.push("poor air quality");
  }

  if (wind >= 40) {
    baseScore += 25;
    reasons.push("high wind");
  } else if (wind >= 20) {
    baseScore += 10;
    reasons.push("moderate wind");
  }

  if (visibility <= 5) {
    baseScore += 25;
    reasons.push("very low visibility");
  } else if (visibility <= 10) {
    baseScore += 10;
    reasons.push("reduced visibility");
  }

  if (recommendedRoute?.weatherRiskScore) {
    baseScore += Math.round(recommendedRoute.weatherRiskScore * 0.45);
    if (recommendedRoute.reasons?.length) {
      recommendedRoute.reasons.forEach((reason) => {
        if (!reasons.includes(reason)) reasons.push(reason);
      });
    }
  }

  const score = Math.min(baseScore, 100);
  const delay = recommendedRoute?.predictedDelayMinutes ?? 0;
  const eta =
    recommendedRoute?.etaWithDelayMinutes != null
      ? `${recommendedRoute.etaWithDelayMinutes} min`
      : "—";

  return {
    score,
    probability: probabilityLabel(score),
    delay,
    eta,
    reasons,
  };
}

export default async function PredictionAnalysisPage({ searchParams }) {
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

  const prediction = buildPrediction(weather, recommendedRoute);

  const cards = [
    {
      title: "Delay risk score",
      value: prediction.score,
      sub: prediction.probability,
    },
    {
      title: "Predicted delay",
      value: `+${prediction.delay} min`,
      sub: "Weather + route risk",
    },
    {
      title: "ETA impact",
      value: prediction.eta,
      sub: recommendedRoute ? recommendedRoute.label : "No route selected",
    },
    {
      title: "Air quality influence",
      value: weather.current.airQuality,
      sub: "Live AQI signal",
    },
  ];

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const pageTitleColor = isLight ? "#17345f" : "#ffffff";
  const pageSubColor = isLight ? "#5e7298" : "#d6def1";

  const cardBackground = isLight ? "#ffffff" : "#2a3b66";
  const cardBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid transparent";
  const cardShadow = isLight
    ? "0 10px 24px rgba(16, 38, 79, 0.06)"
    : "none";

  const cardLabelColor = isLight ? "#4f6791" : "#d6def1";
  const cardValueColor = isLight ? "#17345f" : "#ffffff";
  const cardSubColor = isLight ? "#6f83a8" : "#d6def1";

  const panelBackground = isLight ? "#ffffff" : "#2a3b66";
  const panelBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid transparent";
  const panelShadow = isLight
    ? "0 10px 24px rgba(16, 38, 79, 0.06)"
    : "none";

  const chipBg = isLight ? "#f7d9c8" : "rgba(255,255,255,0.08)";
  const chipText = isLight ? "#17345f" : "#d9e3f6";
  const emptyText = isLight ? "#4f6791" : "#d6def1";

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
        Prediction analysis
      </div>

      <div
        style={{
          marginTop: 6,
          color: pageSubColor,
          fontSize: 14,
        }}
      >
        AI-style risk forecasting based on live weather and route signals
      </div>

      <RouteSearchForm />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: cardBackground,
              border: cardBorder,
              boxShadow: cardShadow,
              borderRadius: 18,
              padding: 18,
              minHeight: 130,
              boxSizing: "border-box",
            }}
          >
            <div style={{ fontSize: 13, color: cardLabelColor }}>
              {card.title}
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: 28,
                fontWeight: 700,
                color: cardValueColor,
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                marginTop: 10,
                color: cardSubColor,
                fontSize: 13,
              }}
            >
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          background: panelBackground,
          border: panelBorder,
          boxShadow: panelShadow,
          borderRadius: 18,
          padding: 20,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            marginBottom: 14,
            color: cardValueColor,
          }}
        >
          Risk drivers
        </div>

        {prediction.reasons.length ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {prediction.reasons.map((reason) => (
              <span
                key={reason}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: chipBg,
                  color: chipText,
                  fontSize: 13,
                }}
              >
                {reason}
              </span>
            ))}
          </div>
        ) : (
          <div style={{ color: emptyText, fontSize: 14 }}>
            Add an origin and destination to generate full route-based prediction signals.
          </div>
        )}
      </div>
    </div>
  );
}
