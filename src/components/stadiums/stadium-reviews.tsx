"use client";

import { useState } from "react";
import Image from "next/image";

interface ReviewUser {
  name: string | null;
  image: string | null;
}

interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: Date;
  user: ReviewUser;
}

interface StadiumReviewsProps {
  reviews: Review[];
}

export default function StadiumReviews({ reviews }: StadiumReviewsProps) {
  const [visibleReviews, setVisibleReviews] = useState(3);

  if (reviews.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No reviews yet. Be the first to leave a review!
      </div>
    );
  }

  const showMoreReviews = () => {
    setVisibleReviews((prev) => prev + 3);
  };

  return (
    <div className="space-y-6">
      {reviews.slice(0, visibleReviews).map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              {review.user.image ? (
                <Image
                  src={review.user.image}
                  width={40}
                  height={40}
                  className="rounded-full"
                  alt={review.user.name || "User"}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {review.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">
                  {review.user.name || "Anonymous User"}
                </h4>
                <p className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center mt-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 15.934l-6.18 3.254 1.18-6.876L.348 7.754l6.895-1.002L10 .516l2.757 6.236 6.895 1.002-4.652 4.558 1.18 6.876L10 15.934z"
                      clipRule="evenodd"
                    />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">{review.content}</p>
            </div>
          </div>
        </div>
      ))}

      {visibleReviews < reviews.length && (
        <div className="text-center">
          <button
            onClick={showMoreReviews}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
} 