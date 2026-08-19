"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

/* Fix default marker icons */
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function normalizePoint(point) {
  if (!point) return null;

  // [lng, lat]
  if (Array.isArray(point) && point.length >= 2) {
    const lng = Number(point[0]);
    const lat = Number(point[1]);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return [lat, lng];
    }
  }

  // { lat, lng } / { latitude, longitude }
  const lat =
    typeof point.lat === "number"
      ? point.lat
      : typeof point.latitude === "number"
      ? point.latitude
      : null;

  const lng =
    typeof point.lng === "number"
      ? point.lng
      : typeof point.lon === "number"
      ? point.lon
      : typeof point.longitude === "number"
      ? point.longitude
      : null;

  if (lat !== null && lng !== null) {
    return [lat, lng];
  }

  return null;
}

function extractRouteLine(route) {
  if (!route) return [];

  const candidates = [
    route?.geometry?.coordinates,
    route?.coordinates,
    route?.path,
    route?.points,
    route?.polylinePoints,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) {
      const line = c.map(normalizePoint).filter(Boolean);
      if (line.length > 1) return line;
    }
  }

  return [];
}

function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, points]);

  return null;
}

export default function RouteLeafletMap({
  city,
  centerLat,
  centerLon,
  routeData,
  origin,
  destination,
}) {
  const routes = useMemo(() => {
    return (routeData?.routes || [])
      .map((r) => ({
        route: r,
        line: extractRouteLine(r),
      }))
      .filter((r) => r.line.length > 1);
  }, [routeData]);

  const recommended = routes.find((r) => r.route?.recommended) || routes[0];

  const originPoint = recommended?.line?.[0] ?? null;
  const destinationPoint =
    recommended?.line?.[recommended.line.length - 1] ?? null;

  const fitPoints = [
    ...(originPoint ? [originPoint] : []),
    ...(destinationPoint ? [destinationPoint] : []),
    ...(recommended?.line || []),
  ];

  if (!origin || !destination) {
    return (
      <div
        style={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d6def1",
          padding: 24,
        }}
      >
        Enter source and destination to view the route map for {city}.
      </div>
    );
  }

  if (!recommended) {
    return (
      <div
        style={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d6def1",
          padding: 24,
        }}
      >
        No route geometry available.
      </div>
    );
  }

  return (
    <MapContainer
      center={[centerLat, centerLon]}
      zoom={11}
      style={{ height: 420, width: "100%" }}
      scrollWheelZoom
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {fitPoints.length > 0 && <FitBounds points={fitPoints} />}

      {routes.map(({ route, line }, i) => {
        const isRecommended = route?.recommended;
        return (
          <Polyline
            key={i}
            positions={line}
            pathOptions={{
              color: isRecommended ? "#f2cf2f" : "#6aa9ff",
              weight: isRecommended ? 6 : 4,
              opacity: isRecommended ? 0.95 : 0.4,
            }}
          />
        );
      })}

      {originPoint && (
        <Marker position={originPoint}>
          <Tooltip permanent>Source</Tooltip>
        </Marker>
      )}

      {destinationPoint && (
        <Marker position={destinationPoint}>
          <Tooltip permanent>Destination</Tooltip>
        </Marker>
      )}
    </MapContainer>
  );
}

