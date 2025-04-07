import StadiumList from "@/components/stadiums/stadium-list";
import StadiumFilters from "@/components/stadiums/stadium-filters";
import SearchBox from "@/components/stadiums/search-box";
import StadiumSort from "@/components/stadiums/stadium-sort";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

interface SearchParams {
  city?: string;
  sport?: string;
  priceMin?: string;
  priceMax?: string;
  date?: string;
  page?: string;
  sort?: string;
  q?: string;
}

// Make sure this is a Server Component to handle the searchParams
export const dynamic = 'force-dynamic';

export default async function StadiumsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Use the Next.js stable pattern for searchParams
  const searchParamsObj = searchParams || {};
  
  // Destructure searchParams with default values
  const { 
    page = '1', 
    city = '', 
    sport = '', 
    priceMin = '', 
    priceMax = '',
    sort = 'newest',
    q = ''
  } = searchParamsObj;
  
  const pageNumber = Number(page) || 1;
  const pageSize = 12;
  const skip = (pageNumber - 1) * pageSize;

  // Build filter conditions
  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { sportTypes: { has: q } },
    ];
  }

  if (city) {
    where.city = {
      contains: city,
      mode: "insensitive",
    };
  }

  if (sport) {
    where.sportTypes = {
      has: sport,
    };
  }

  if (priceMin || priceMax) {
    where.pricePerHour = {};
    
    if (priceMin) {
      where.pricePerHour.gte = parseFloat(priceMin);
    }
    
    if (priceMax) {
      where.pricePerHour.lte = parseFloat(priceMax);
    }
  }

  // Build orderBy based on sort parameter
  let orderBy: any = { createdAt: "desc" }; // default sort
  switch (sort) {
    case "price-asc":
      orderBy = { pricePerHour: "asc" };
      break;
    case "price-desc":
      orderBy = { pricePerHour: "desc" };
      break;
    case "rating":
      orderBy = { reviews: { _count: "desc" } };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const stadiumsData = await prisma.stadium.findMany({
    where,
    include: {
      images: {
        take: 1, // Just get the first image for the preview
      },
      owner: {
        select: {
          name: true,
        },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
    skip,
    take: pageSize,
    orderBy,
  });

  // Convert non-serializable Decimal objects to plain numbers
  const stadiums = stadiumsData.map(stadium => ({
    ...stadium,
    pricePerHour: parseFloat(stadium.pricePerHour.toString()),
    createdAt: stadium.createdAt.toISOString(),
    updatedAt: stadium.updatedAt.toISOString(),
  }));

  const totalStadiums = await prisma.stadium.count({ where });
  const totalPages = Math.ceil(totalStadiums / pageSize);

  // Get popular cities for filters
  const popularCities = await prisma.stadium.groupBy({
    by: ["city"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 5,
  });

  // Get all sport types available
  const allSportTypes = await prisma.stadium.findMany({
    select: {
      sportTypes: true,
    },
  });

  // Flatten and deduplicate the sport types
  const sportTypes = Array.from(
    new Set(allSportTypes.flatMap((stadium: { sportTypes: string[] }) => stadium.sportTypes))
  ) as string[];

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="bg-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-white">
            Find the Perfect Stadium
          </h1>
          <div className="mt-6">
            <Suspense fallback={<div className="h-12 bg-gray-200 rounded-lg animate-pulse" />}>
              <SearchBox initialQuery={q} />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="h-96 bg-gray-200 rounded-lg animate-pulse" />}>
              <StadiumFilters 
                cities={popularCities.map((c: { city: string }) => c.city)} 
                sportTypes={sportTypes}
                currentFilters={{ city, sport, priceMin, priceMax }} 
              />
            </Suspense>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-black">
                  {totalStadiums} {totalStadiums === 1 ? 'Stadium' : 'Stadiums'} found
                </h2>
                <Suspense fallback={<div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />}>
                  <StadiumSort currentSort={sort} />
                </Suspense>
              </div>
            </div>
            
            <Suspense fallback={<div className="h-96 bg-gray-200 rounded-lg animate-pulse" />}>
              <StadiumList 
                stadiums={stadiums} 
                currentPage={pageNumber} 
                totalPages={totalPages} 
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 