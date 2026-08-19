export default function WeatherIcon({ code, size = 40, showLabel = false }) {
  const weatherCode = Number(code);

  let icon = "☁️";
  let label = "Cloudy";

  if (weatherCode === 0) {
    icon = "☀️";
    label = "Clear sky";
  } else if ([1, 2].includes(weatherCode)) {
    icon = "🌤️";
    label = "Partly cloudy";
  } else if (weatherCode === 3) {
    icon = "☁️";
    label = "Overcast";
  } else if ([45, 48].includes(weatherCode)) {
    icon = "🌫️";
    label = "Fog";
  } else if (
    [51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    icon = "🌧️";
    label = "Rain";
  } else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    icon = "❄️";
    label = "Snow";
  } else if ([95, 96, 99].includes(weatherCode)) {
    icon = "⛈️";
    label = "Thunderstorm";
  }

  if (!showLabel) {
    return (
      <span
        role="img"
        aria-label={label}
        title={label}
        style={{
          fontSize: size,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>
    );
  }

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <span
        role="img"
        aria-label={label}
        title={label}
        style={{
          fontSize: size,
          lineHeight: 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </span>

      <span
        style={{
          fontSize: Math.max(12, Math.round(size * 0.28)),
          lineHeight: 1.2,
          color: "#edf2ff",
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}