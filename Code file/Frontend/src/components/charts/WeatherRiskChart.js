"use client";

export default function WeatherRiskChart({ weatherData }) {
  const riskValue = Number(weatherData?.risk ?? 0);

  const data = [
    {
      value: Number.isFinite(riskValue) ? Number(riskValue.toFixed(1)) : 0,
      name: "Risk",
    },
  ];

  return (
    <div>
      {/* render your chart here using data */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}