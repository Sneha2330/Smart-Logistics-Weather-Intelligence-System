"use client";

export default function MetricCard({ title, value, subtitle }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-3 text-3xl font-semibold">{value}</h3>
      {subtitle ? (
        <p className="mt-2 text-xs text-gray-400">{subtitle}</p>
      ) : null}
    </div>
  );
}