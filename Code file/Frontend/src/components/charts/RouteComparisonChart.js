"use client";

import ReactECharts from "echarts-for-react";

export default function RouteComparisonChart({ routeData }) {
  if (!routeData || routeData.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Route Comparison</h2>
        <p>No route data available.</p>
      </div>
    );
  }

  const option = {
    tooltip: { trigger: "axis" },
    legend: { data: ["Distance (km)", "Risk Score"] },
    xAxis: {
      type: "category",
      data: routeData.map((route) => route.type),
    },
    yAxis: [
      {
        type: "value",
        name: "Distance (km)",
      },
      {
        type: "value",
        name: "Risk Score",
      },
    ],
    series: [
      {
        name: "Distance (km)",
        type: "bar",
        data: routeData.map((route) => route.distance),
      },
      {
        name: "Risk Score",
        type: "line",
        yAxisIndex: 1,
        data: routeData.map((route) => route.risk_score),
      },
    ],
  };

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Route Comparison</h2>
      <ReactECharts option={option} style={{ height: "360px", width: "100%" }} />
    </div>
  );
}