import RouteSearchForm from "@/components/route-intelligence/RouteSearchForm";
import { getWeatherDashboardData } from "@/lib/weather";
import { getRouteComparison } from "@/lib/routes";

function toNumberFromText(value) {
  if (value == null) return 0;
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function buildRecommendations(weather, routeData) {
  const recommendations = [];

  const current = weather?.current || {};
  const airQuality = Number(current.airQuality || 0);
  const wind = toNumberFromText(current.wind);
  const visibility = toNumberFromText(current.visibility);

  const recommendedRoute =
    routeData?.routes?.find((route) => route.recommended) || null;

  if (recommendedRoute) {
    recommendations.push({
      title: "Use recommended route",
      priority:
        recommendedRoute.weatherRiskScore >= 70
          ? "Critical"
          : recommendedRoute.weatherRiskScore >= 45
          ? "High"
          : "Moderate",
      action: `Dispatch through ${recommendedRoute.label}`,
      reason: `Lowest combined weather-adjusted route score with ETA ${recommendedRoute.etaWithDelayMinutes} min and predicted delay +${recommendedRoute.predictedDelayMinutes} min.`,
      impact: `${recommendedRoute.distanceKm} km · Weather risk ${recommendedRoute.weatherRiskScore}`,
    });

    if (recommendedRoute.predictedDelayMinutes >= 15) {
      recommendations.push({
        title: "Add delivery buffer",
        priority:
          recommendedRoute.predictedDelayMinutes >= 30 ? "High" : "Moderate",
        action: `Add ${recommendedRoute.predictedDelayMinutes} min contingency to ETA`,
        reason: "Predicted delay exceeds operational buffer threshold.",
        impact: `ETA becomes ${recommendedRoute.etaWithDelayMinutes} min`,
      });
    }

    if (recommendedRoute.reasons?.length) {
      recommendations.push({
        title: "Monitor risk drivers",
        priority:
          recommendedRoute.weatherRiskScore >= 70
            ? "Critical"
            : recommendedRoute.weatherRiskScore >= 45
            ? "High"
            : "Moderate",
        action: "Track route conditions during dispatch",
        reason: recommendedRoute.reasons.join(", "),
        impact: `Sampled route weather points: ${recommendedRoute.reasons.length}`,
      });
    }
  }

  if (visibility > 0 && visibility <= 10) {
    recommendations.push({
      title: "Low visibility protocol",
      priority: visibility <= 5 ? "Critical" : "High",
      action: "Reduce speed and review dispatch timing",
      reason: `Visibility is currently ${current.visibility}`,
      impact: "Potential ETA degradation and safety risk",
    });
  }

  if (wind >= 20) {
    recommendations.push({
      title: "Wind advisory",
      priority: wind >= 40 ? "High" : "Moderate",
      action: "Apply weather risk review for exposed corridors",
      reason: `Current wind is ${current.wind}`,
      impact: "May increase route delay probability",
    });
  }

  if (airQuality >= 150) {
    recommendations.push({
      title: "Operational environment alert",
      priority: "High",
      action: "Flag route for environmental operating review",
      reason: `Air quality index is ${airQuality}`,
      impact: "Poor environmental conditions may affect field operations",
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      title: "Stable operating window",
      priority: "Low",
      action: "Proceed with normal dispatch plan",
      reason: "No elevated weather-route risk indicators detected",
      impact: "Standard monitoring only",
    });
  }

  return recommendations;
}

function priorityStyle(priority) {
  if (priority === "Critical") {
    return { bg: "#ff6b6b", text: "#102553" };
  }
  if (priority === "High") {
    return { bg: "#ffb347", text: "#102553" };
  }
  if (priority === "Moderate") {
    return { bg: "#74b7ff", text: "#102553" };
  }
  return { bg: "#57d37a", text: "#102553" };
}

export default async function RecommendationsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

  const city =
    typeof resolvedSearchParams?.city === "string"
      ? resolvedSearchParams.city.trim()
      : "";

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

  if (!city) {
    return (
      <div
        style={{
          background: isLight ? "#fff0e6" : "transparent",
          color: isLight ? "#17345f" : "#fff",
          padding: 18,
          borderRadius: 24,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>Recommendations</div>
        <div
          style={{
            marginTop: 16,
            color: isLight ? "#5e7298" : "#d6def1",
          }}
        >
          Search for a location first to generate live operational recommendations.
        </div>
      </div>
    );
  }

  let weather = null;
  let routeData = null;
  let routeError = null;

  try {
    weather = await getWeatherDashboardData(city);
  } catch (error) {
    return (
      <div
        style={{
          background: isLight ? "#fff0e6" : "transparent",
          color: isLight ? "#17345f" : "#fff",
          padding: 18,
          borderRadius: 24,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 700 }}>Recommendations</div>
        <div
          style={{
            marginTop: 16,
            color: isLight ? "#5e7298" : "#d6def1",
          }}
        >
          Unable to load live weather signals: {String(error.message || error)}
        </div>
      </div>
    );
  }

  if (origin && destination) {
    try {
      routeData = await getRouteComparison(origin, destination);
    } catch (error) {
      routeError = String(error.message || error);
    }
  }

  const recommendations = buildRecommendations(weather, routeData);

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const pageTitleColor = isLight ? "#17345f" : "#ffffff";
  const pageSubColor = isLight ? "#5e7298" : "#d6def1";

  const errorBackground = isLight
    ? "rgba(255, 179, 71, 0.16)"
    : "rgba(255, 179, 71, 0.12)";
  const errorBorder = isLight
    ? "1px solid rgba(255, 179, 71, 0.45)"
    : "1px solid rgba(255, 179, 71, 0.35)";
  const errorText = isLight ? "#17345f" : "#ffffff";

  const cardBackground = isLight ? "#ffffff" : "#2a3b66";
  const cardBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid transparent";
  const cardShadow = isLight
    ? "0 10px 24px rgba(16, 38, 79, 0.06)"
    : "none";

  const cardTitleColor = isLight ? "#17345f" : "#ffffff";
  const cardActionColor = isLight ? "#17345f" : "#ffffff";
  const cardReasonColor = isLight ? "#4f6791" : "#d6def1";
  const cardImpactColor = isLight ? "#6f83a8" : "#bcc9e2";

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
        Recommendations
      </div>

      <div
        style={{
          marginTop: 6,
          color: pageSubColor,
          fontSize: 14,
        }}
      >
        Live operational recommendations based on weather and route intelligence
      </div>

      <RouteSearchForm />

      {routeError ? (
        <div
          style={{
            marginTop: 20,
            background: errorBackground,
            border: errorBorder,
            color: errorText,
            padding: 16,
            borderRadius: 16,
          }}
        >
          Route comparison is temporarily unavailable: {routeError}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 18,
          marginTop: 24,
        }}
      >
        {recommendations.map((item, index) => {
          const badge = priorityStyle(item.priority);

          return (
            <div
              key={`${item.title}-${index}`}
              style={{
                background: cardBackground,
                border: cardBorder,
                boxShadow: cardShadow,
                borderRadius: 18,
                padding: 20,
                boxSizing: "border-box",
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
                  {item.title}
                </div>

                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: badge.bg,
                    color: badge.text,
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {item.priority}
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 22,
                  fontWeight: 700,
                  color: cardActionColor,
                }}
              >
                {item.action}
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: cardReasonColor,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {item.reason}
              </div>

              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: cardImpactColor,
                }}
              >
                Impact: {item.impact}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
