"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface StadiumSortProps {
  currentSort: string;
}

export default function StadiumSort({ currentSort }: StadiumSortProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", e.target.value);
    router.push(`/stadiums?${params.toString()}`);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-black">Sort by:</span>
      <select 
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black"
        defaultValue={currentSort}
        onChange={handleSortChange}
      >
        <option value="newest" className="text-black">Newest</option>
        <option value="price-asc" className="text-black">Price: Low to High</option>
        <option value="price-desc" className="text-black">Price: High to Low</option>
        <option value="rating" className="text-black">Rating</option>
      </select>
    </div>
  );
} 