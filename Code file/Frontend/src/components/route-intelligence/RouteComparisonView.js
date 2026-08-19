"use client";

import { useSearchParams } from "next/navigation";

export default function RouteComparisonView({ routeData }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get("theme") || "dark";
  const isLight = theme === "light";

  if (!routeData?.routes?.length) {
    return null;
  }

  const panelBackground = isLight ? "#fff0e6" : "#2a3b66";
  const panelTitleColor = isLight ? "#17345f" : "#ffffff";
  const panelSubColor = isLight ? "#5e7298" : "#d6def1";

  const cardBackground = isLight ? "#ffffff" : "#243760";
  const cardBorder = isLight
    ? "1px solid rgba(24, 61, 122, 0.10)"
    : "1px solid transparent";
  const recommendedBorder = isLight
    ? "2px solid #f4cd2f"
    : "2px solid #f4cd2f";

  const cardTitleColor = isLight ? "#17345f" : "#ffffff";
  const labelColor = isLight ? "#4f6791" : "#bcc9e2";
  const valueColor = isLight ? "#17345f" : "#ffffff";
  const mutedColor = isLight ? "#6f83a8" : "#d6def1";

  const chipBg = isLight ? "#f7d9c8" : "rgba(255,255,255,0.08)";
  const chipText = isLight ? "#17345f" : "#d9e3f6";

  return (
    <div
      style={{
        background: panelBackground,
        borderRadius: 22,
        padding: 24,
        boxSizing: "border-box",
        marginTop: 24,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: panelTitleColor,
        }}
      >
        Route intelligence
      </div>

      <div
        style={{
          marginTop: 6,
          color: panelSubColor,
          fontSize: 14,
        }}
      >
        {routeData.origin.name} → {routeData.destination.name}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          marginTop: 20,
        }}
      >
        {routeData.routes.map((route) => (
          <div
            key={route.id}
            style={{
              background: cardBackground,
              borderRadius: 18,
              padding: 18,
              boxSizing: "border-box",
              border: route.recommended ? recommendedBorder : cardBorder,
              boxShadow: isLight
                ? "0 10px 24px rgba(16, 38, 79, 0.06)"
                : "none",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
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
                {route.label}
              </div>

              {route.recommended ? (
                <div
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    background: "#f4cd2f",
                    color: "#19284d",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Recommended
                </div>
              ) : null}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: labelColor }}>Distance</div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: 700,
                    color: valueColor,
                  }}
                >
                  {route.distanceKm} km
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: labelColor }}>ETA</div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: 700,
                    color: valueColor,
                  }}
                >
                  {route.durationMinutes} min
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: labelColor }}>
                  Weather risk
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: 700,
                    color: valueColor,
                  }}
                >
                  {route.weatherRiskScore}
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: mutedColor,
                  }}
                >
                  {route.weatherRiskCategory}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: labelColor }}>
                  Predicted delay
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 18,
                    fontWeight: 700,
                    color: valueColor,
                  }}
                >
                  +{route.predictedDelayMinutes} min
                </div>
              </div>
            </div>

            {route.reasons?.length ? (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: labelColor }}>
                  Risk drivers
                </div>
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {route.reasons.map((reason) => (
                    <span
                      key={reason}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: chipBg,
                        color: chipText,
                        fontSize: 12,
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}