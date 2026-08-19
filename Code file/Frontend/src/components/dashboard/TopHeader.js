"use client";

import { Search, Bell, RefreshCcw } from "lucide-react";

export default function TopHeader({
  title = "Dashboard Overview",
  subtitle = "Real-time sustainability and predictive logistics",
  searchTerm = "",
  setSearchTerm = () => {},
  onRefresh = () => {},
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 rounded-full border bg-gray-50 px-4 py-2 text-sm text-gray-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search shipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none"
          />
        </div>

        <button
          onClick={onRefresh}
          className="rounded-full border p-2 hover:bg-gray-100"
        >
          <RefreshCcw size={18} />
        </button>

        <button className="rounded-full border p-2 hover:bg-gray-100">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}