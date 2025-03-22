import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/prisma";
import BookingForm from "@/components/stadiums/booking-form";
import StadiumReviews from "@/components/stadiums/stadium-reviews";
import StadiumGallery from "@/components/stadiums/stadium-gallery";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { MapPin } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8">
      <div className="bg-gray-800 text-white rounded-lg p-4 mb-6">
        <div className="text-sm breadcrumbs">
          <ul>
            <li><Link href="/" className="text-blue-400 hover:text-blue-300">Home</Link></li>
            <li><Link href="/stadiums" className="text-blue-400 hover:text-blue-300">Stadiums</Link></li>
            <li className="text-gray-300">{stadium.name}</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Stadium Info Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-2">{stadium.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gray-300" />
                <p className="text-gray-300">{stadium.address}</p>
              </div>
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
          </div>

          {/* Reviews Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reviews</h2>
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

        {/* Booking Form Column */}
        <div className="border border-gray-400 rounded-lg shadow-lg overflow-hidden">
          <BookingForm 
            stadiumId={stadium.id} 
            pricePerHour={stadium.pricePerHour} 
          />
        </div>
      </div>
    </div>
  );
} 