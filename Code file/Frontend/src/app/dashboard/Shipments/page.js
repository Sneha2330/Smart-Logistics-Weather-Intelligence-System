"use client";

import SectionCard from "@/components/dashboard/SectionCard";
import { useDashboard } from "@/lib/dashboard-context";
import { useRouter } from "next/navigation";

export default function ShipmentsPage() {
  const { filteredShipments = [], loadShipmentInsights, loading } = useDashboard();
  const router = useRouter();

  async function handleRowClick(shipment) {
    await loadShipmentInsights(shipment);
    router.push("/dashboard/route-intelligence");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <SectionCard title="Shipments">
        {loading ? (
          <p>Loading shipments...</p>
        ) : filteredShipments.length === 0 ? (
          <p>No shipments found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-3">ID</th>
                <th className="py-3">Code</th>
                <th className="py-3">Origin</th>
                <th className="py-3">Destination</th>
                <th className="py-3">Vehicle</th>
                <th className="py-3">Fuel</th>
                <th className="py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  onClick={() => handleRowClick(shipment)}
                  className="cursor-pointer border-b hover:bg-zinc-100"
                >
                  <td className="py-3">{shipment.id}</td>
                  <td className="py-3">{shipment.shipment_code}</td>
                  <td className="py-3">
                    {shipment.origin_lat}, {shipment.origin_lon}
                  </td>
                  <td className="py-3">
                    {shipment.dest_lat}, {shipment.dest_lon}
                  </td>
                  <td className="py-3">{shipment.vehicle_type}</td>
                  <td className="py-3">{shipment.fuel_type}</td>
                  <td className="py-3">{shipment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
