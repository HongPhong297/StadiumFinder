"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Stadium, StadiumImage, User } from "@prisma/client";
import { useEffect, useState } from "react";

// Override the Stadium type to make serializable types
interface SerializableStadium extends Omit<Stadium, 'pricePerHour' | 'createdAt' | 'updatedAt'> {
  pricePerHour: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface StadiumWithDetails extends SerializableStadium {
  images: StadiumImage[];
  owner: {
    name: string | null;
  };
  _count: {
    reviews: number;
  };
}

interface StadiumListProps {
  stadiums: StadiumWithDetails[];
  currentPage: number;
  totalPages: number;
}

export default function StadiumList({
  stadiums,
  currentPage,
  totalPages,
}: StadiumListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/stadiums?${params.toString()}`);
  };

  // Don't render anything on the server to prevent hydration issues
  if (!mounted) {
    return null;
  }

  if (stadiums.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium text-black mb-4">
          No stadiums found
        </h3>
        <p className="text-black mb-4">
          Try adjusting your search filters to find more results.
        </p>
        <Link
          href="/stadiums"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stadiums.map((stadium) => (
          <Link 
            href={`/stadiums/${stadium.id}`} 
            key={stadium.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative h-48 w-full">
              {stadium.images.length > 0 ? (
                <Image
                  src={stadium.images[0].url}
                  alt={stadium.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-black">No image available</span>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="inline-block bg-blue-600 text-white px-2 py-1 text-xs font-bold rounded">
                  ${stadium.pricePerHour.toFixed(2)}/hr
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black mb-1">
                {stadium.name}
              </h3>
              <p className="text-sm text-black mb-2">
                {stadium.city}, {stadium.state || stadium.country}
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 15.934l-6.18 3.254 1.18-6.876L.348 7.754l6.895-1.002L10 .516l2.757 6.236 6.895 1.002-4.652 4.558 1.18 6.876L10 15.934z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-1 text-sm text-black">
                    {stadium._count.reviews > 0
                      ? `(${stadium._count.reviews} reviews)`
                      : "No reviews yet"}
                  </span>
                </div>
                <div className="text-xs text-black">
                  {stadium.sportTypes.slice(0, 2).join(", ")}
                  {stadium.sportTypes.length > 2 ? "..." : ""}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="relative z-0 inline-flex shadow-sm -space-x-px rounded-md">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                  page === currentPage
                    ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                    : "text-black hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-black hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 