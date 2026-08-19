"use client";

import ReactECharts from "echarts-for-react";

export default function EmissionChart({ emissionData }) {
  if (!emissionData) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Emission Overview</h2>
        <p>No emission data available.</p>
      </div>
    );
  }

  const option = {
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: ["Fuel Used", "CO₂"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        type: "bar",
        data: [emissionData.fuel_used_liters, emissionData.co2_kg],
      },
    ],
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Emission Overview</h2>
      <ReactECharts option={option} style={{ height: "360px", width: "100%" }} />
    </div>
  );
}