"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StadiumFiltersProps {
  cities: string[];
  sportTypes: string[];
  currentFilters: {
    city?: string;
    sport?: string;
    priceMin?: string;
    priceMax?: string;
    date?: string;
  };
}

export default function StadiumFilters({
  cities,
  sportTypes,
  currentFilters,
}: StadiumFiltersProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState({
    city: currentFilters.city || "",
    sport: currentFilters.sport || "",
    priceMin: currentFilters.priceMin || "",
    priceMax: currentFilters.priceMax || "",
    date: currentFilters.date || "",
  });

  // Prevent hydration errors by ensuring we only render after mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    router.push(`/stadiums?${params.toString()}`);
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      sport: "",
      priceMin: "",
      priceMax: "",
      date: "",
    });
    router.push("/stadiums");
  };

  // Don't render anything on the server to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-black mb-4">Filters</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-black mb-1">
            City
          </label>
          <select
            id="city"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
          >
            <option value="" className="text-black">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city} className="text-black">
                {city}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="sport" className="block text-sm font-medium text-black mb-1">
            Sport Type
          </label>
          <select
            id="sport"
            name="sport"
            value={filters.sport}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
          >
            <option value="" className="text-black">All Sports</option>
            {sportTypes.map((sport) => (
              <option key={sport} value={sport} className="text-black">
                {sport}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Price Range (per hour)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                name="priceMin"
                placeholder="Min"
                value={filters.priceMin}
                onChange={handleFilterChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-gray-500"
              />
            </div>
            <div>
              <input
                type="number"
                name="priceMax"
                placeholder="Max"
                value={filters.priceMax}
                onChange={handleFilterChange}
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black placeholder-gray-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-black mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
          />
        </div>
        
        <div className="pt-2 flex space-x-2">
          <button
            type="button"
            onClick={applyFilters}
            className="flex-1 bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
} 