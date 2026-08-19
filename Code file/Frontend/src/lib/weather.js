export async function getWeatherDashboardData(city) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const url = city
    ? `${API_BASE}/weather/dashboard?city=${encodeURIComponent(city)}`
    : `${API_BASE}/weather/dashboard?city=Bengaluru`;

  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  const raw = await response.text();

  let payload;
  try {
    payload = raw ? JSON.parse(raw) : null;
  } catch {
    payload = raw;
  }

  if (!response.ok) {
    const detail =
      typeof payload === "object" && payload?.detail
        ? payload.detail
        : typeof payload === "string"
        ? payload
        : `HTTP ${response.status}`;

    throw new Error(
      `Failed to load weather dashboard: ${response.status} - ${detail}`
    );
  }

  return payload;
}