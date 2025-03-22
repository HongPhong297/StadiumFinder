"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchBoxProps {
  initialCity?: string;
}

export default function SearchBox({ initialCity = "" }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState(initialCity);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      params.set("city", searchTerm.trim());
      router.push(`/stadiums?${params.toString()}`);
    } else {
      router.push("/stadiums");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex rounded-md shadow-sm">
        <div className="relative flex items-stretch flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            name="search"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300 py-3 bg-white text-black placeholder-gray-500"
            placeholder="Search by city, stadium name, or sport type"
          />
        </div>
        <button
          type="submit"
          className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <span>Search</span>
        </button>
      </div>
    </form>
  );
} 