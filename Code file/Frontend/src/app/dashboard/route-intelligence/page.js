import { getRouteComparison } from "@/lib/routes";
import RouteSearchForm from "@/components/route-intelligence/RouteSearchForm";
import RouteComparisonView from "@/components/route-intelligence/RouteComparisonView";

export default async function RouteIntelligencePage({ searchParams }) {
  const resolvedSearchParams = await searchParams;

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

  let routeData = null;
  let routeError = null;

  if (origin && destination) {
    try {
      routeData = await getRouteComparison(origin, destination);
    } catch (error) {
      routeError = String(error?.message || error);
    }
  }

  const pageBackground = isLight ? "#fff0e6" : "transparent";
  const titleColor = isLight ? "#17345f" : "#ffffff";
  const subColor = isLight ? "#5e7298" : "#d6def1";

  const infoCardBackground = isLight ? "#ffffff" : "#2a3b66";
  const infoCardText = isLight ? "#4f6791" : "#d6def1";
  const infoCardBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid transparent";
  const infoCardShadow = isLight
    ? "0 10px 24px rgba(16, 38, 79, 0.06)"
    : "none";

  const errorBackground = isLight
    ? "rgba(255, 179, 71, 0.16)"
    : "rgba(255, 179, 71, 0.12)";
  const errorBorder = isLight
    ? "1px solid rgba(255, 179, 71, 0.45)"
    : "1px solid rgba(255, 179, 71, 0.35)";
  const errorText = isLight ? "#17345f" : "#ffffff";

  return (
    <div
      style={{
        background: pageBackground,
        color: titleColor,
        padding: 18,
        borderRadius: 24,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: titleColor }}>
        Route intelligence
      </div>

      <div
        style={{
          marginTop: 6,
          color: subColor,
          fontSize: 14,
        }}
      >
        Compare alternate routes and avoid weather-related delays
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
          Route intelligence is temporarily unavailable: {routeError}
        </div>
      ) : null}

      {!origin || !destination ? (
        <div
          style={{
            marginTop: 24,
            background: infoCardBackground,
            border: infoCardBorder,
            boxShadow: infoCardShadow,
            borderRadius: 18,
            padding: 20,
            color: infoCardText,
          }}
        >
          Enter an origin and destination above to compare live alternate routes.
        </div>
      ) : null}

      <RouteComparisonView routeData={routeData} />
    </div>
  );
}
