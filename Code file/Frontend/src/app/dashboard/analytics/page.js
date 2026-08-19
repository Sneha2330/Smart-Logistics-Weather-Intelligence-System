"use client";

import RouteComparisonChart from "@/components/charts/RouteComparisonChart";
import WeatherRiskChart from "@/components/charts/WeatherRiskChart";
import EmissionChart from "@/components/charts/EmissionChart";
import { useDashboard } from "@/lib/dashboard-context";

export default function AnalyticsPage() {
  const { routeData, weatherData, emissionData } = useDashboard();

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RouteComparisonChart routeData={routeData} />
        <WeatherRiskChart weatherData={weatherData} />
      </div>

      <EmissionChart emissionData={emissionData} />
    </div>
  );
}
