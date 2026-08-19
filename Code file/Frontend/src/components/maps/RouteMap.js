"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons in Next.js
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function normalizeGeometry(geometry) {
  if (!geometry) return [];

  if (typeof geometry === "object" && geometry.coordinates) {
    return geometry.coordinates.map(([lon, lat]) => [lat, lon]);
  }

  if (typeof geometry === "string") {
    try {
      const parsed = JSON.parse(geometry);
      if (parsed.coordinates) {
        return parsed.coordinates.map(([lon, lat]) => [lat, lon]);
      }
    } catch (error) {
      console.error("Failed to parse geometry:", error);
    }
  }

  return [];
}

function FitBounds({ shipment, routeData }) {
  const map = useMap();

  if (!shipment) return null;

  const origin = [shipment.origin_lat, shipment.origin_lon];
  const destination = [shipment.dest_lat, shipment.dest_lon];

  const allPoints = [origin, destination];

  (routeData || []).forEach((route) => {
    const coords = normalizeGeometry(route.geometry);
    coords.forEach((point) => allPoints.push(point));
  });

  if (allPoints.length > 1) {
    const bounds = L.latLngBounds(allPoints);
    map.fitBounds(bounds, { padding: [40, 40] });
  }

  return null;
}

export default function RouteMap({ shipment, routeData = [] }) {
  if (!shipment) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Route Map</h2>
        <p>No shipment selected.</p>
      </div>
    );
  }

  const origin = [shipment.origin_lat, shipment.origin_lon];
  const destination = [shipment.dest_lat, shipment.dest_lon];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Route Map</h2>

      <div className="h-125 w-full overflow-hidden rounded-xl">
        <MapContainer
          center={origin}
          zoom={7}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.opens'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitBounds shipment={shipment} routeData={routeData} />

          <Marker position={origin}>
            <Popup>
              <strong>Origin</strong>
              <br />
              {shipment.origin_lat}, {shipment.origin_lon}
            </Popup>
          </Marker>

          <Marker position={destination}>
            <Popup>
              <strong>Destination</strong>
              <br />
              {shipment.dest_lat}, {shipment.dest_lon}
            </Popup>
          </Marker>

          {routeData.map((route, index) => {
            const positions = normalizeGeometry(route.geometry);

            if (!positions.length) return null;

            return (
              <Polyline
                key={index}
                positions={positions}
                pathOptions={{
                  color:
                    route.recommended === 1
                      ? "green"
                      : index === 0
                      ? "blue"
                      : "orange",
                  weight: route.recommended === 1 ? 6 : 4,
                  opacity: 0.9,
                }}
              >
                <Popup>
                  <div>
                    <strong>{route.type}</strong>
                    <br />
                    Distance: {route.distance} km
                    <br />
                    Duration: {route.duration} min
                    <br />
                    Risk Score: {route.risk_score}
                    <br />
                    {route.recommended === 1
                      ? "Recommended Route"
                      : "Alternative Route"}
                  </div>
                </Popup>
              </Polyline>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
