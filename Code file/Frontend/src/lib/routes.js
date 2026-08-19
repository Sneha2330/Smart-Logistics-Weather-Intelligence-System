const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not set in .env.local");
}

export async function getRouteComparison(origin, destination) {
  const url = `${API_BASE}/routes/compare?origin=${encodeURIComponent(
    origin
  )}&destination=${encodeURIComponent(destination)}`;

  const response = await fetch(url, {
    cache: "no-store",
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

    throw new Error(`Route compare failed: ${detail}`);
  }

  return payload;
}