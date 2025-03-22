import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import BookingForm from "@/components/stadiums/booking-form";
import StadiumReviews from "@/components/stadiums/stadium-reviews";
import StadiumGallery from "@/components/stadiums/stadium-gallery";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface StadiumPageProps {
  params: {
    id: string;
  };
}

export default async function StadiumPage({ params }: StadiumPageProps) {
  const session = await getServerSession(authOptions);
  
  // Get the ID from params (params are now properly typed and don't need to be awaited)
  const id = params.id;
  
  // Fetch stadium details with images, owner info, and reviews
  const stadiumData = await prisma.stadium.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!stadiumData) {
    notFound();
  }

  // Convert the Decimal to a plain number to avoid serialization issues
  const stadium = {
    ...stadiumData,
    pricePerHour: parseFloat(stadiumData.pricePerHour.toString()),
    // Convert date objects to ISO strings to avoid serialization issues
    createdAt: stadiumData.createdAt.toISOString(),
    updatedAt: stadiumData.updatedAt.toISOString(),
    // Convert any other non-serializable objects if needed
  };

  // Calculate average rating
  const reviewCount = stadium.reviews.length;
  const averageRating = reviewCount > 0
    ? stadium.reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) / reviewCount
    : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {stadium.name}
              </h1>
              <p className="text-gray-600 mb-2">
                {stadium.address}, {stadium.city}, {stadium.state || stadium.country}
              </p>
              <div className="flex items-center">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(averageRating)
                          ? "text-yellow-400"
                          : "text-gray-300"
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
                  <span className="ml-2 text-gray-600">
                    {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                <p className="text-2xl font-bold text-blue-600">
                  ${stadium.pricePerHour.toFixed(2)}
                  <span className="text-sm font-normal">/hour</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <StadiumGallery images={stadium.images} name={stadium.name} />
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {stadium.description}
                </p>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Facilities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {stadium.facilities.map((facility: string) => (
                    <div key={facility} className="flex items-center">
                      <svg
                        className="w-5 h-5 text-green-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sports
                </h2>
                <div className="flex flex-wrap gap-2">
                  {stadium.sportTypes.map((sport: string) => (
                    <span
                      key={sport}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {stadium.rules && (
              <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Rules
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {stadium.rules}
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Reviews ({reviewCount})
                  </h2>
                  {session?.user && (
                    <Link
                      href={`/stadiums/${stadium.id}/review`}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Write a Review
                    </Link>
                  )}
                </div>
                <StadiumReviews reviews={stadium.reviews} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden sticky top-6">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Book this Stadium
                </h2>
                <BookingForm
                  stadiumId={stadium.id}
                  pricePerHour={stadium.pricePerHour}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 