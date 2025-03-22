import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("POST /api/stadiums - Session:", session);
    console.log("User role:", session?.user?.role);

    if (!session || !session.user) {
      console.log("Unauthorized: No session or user");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if the user is a stadium owner
    if (session.user.role !== "STADIUM_OWNER") {
      console.log(`User role not stadium owner: ${session.user.role}`);
      return NextResponse.json(
        { message: "Only stadium owners can create stadiums" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Stadium creation request body:", body);
    const {
      name,
      description,
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      pricePerHour,
      sportTypes,
      facilities,
      rules,
      capacity,
      contactPhone,
      contactEmail,
      images,
      availability,
    } = body;

    // Validate required fields
    if (!name || !description || !address || !city || !postalCode || !country || !pricePerHour || !sportTypes || !facilities) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create stadium with owner reference
    const stadium = await prisma.stadium.create({
      data: {
        name,
        description,
        address,
        city,
        state,
        postalCode,
        country,
        latitude,
        longitude,
        pricePerHour,
        sportTypes,
        facilities,
        rules,
        capacity,
        contactPhone,
        contactEmail,
        ownerId: session.user.id,
        isVerified: false,
      },
    });

    // Create stadium images if provided
    if (images && images.length > 0) {
      await prisma.stadiumImage.createMany({
        data: images.map((url: string) => ({
          url,
          stadiumId: stadium.id,
        })),
      });
    }

    // Create availability slots if provided
    if (availability && availability.length > 0) {
      await prisma.availability.createMany({
        data: availability.map((slot: any) => ({
          ...slot,
          stadiumId: stadium.id,
        })),
      });
    }

    // Fetch the created stadium with its relationships
    const createdStadium = await prisma.stadium.findUnique({
      where: {
        id: stadium.id,
      },
      include: {
        images: true,
        availability: true,
      },
    });

    return NextResponse.json(createdStadium, { status: 201 });
  } catch (error) {
    console.error("Stadium creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const city = searchParams.get("city");
    const sport = searchParams.get("sport");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const skip = (page - 1) * pageSize;

    // Build filter conditions
    const where: any = {};

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

    // Get stadiums with pagination
    const stadiums = await prisma.stadium.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get total count for pagination
    const totalStadiums = await prisma.stadium.count({ where });
    const totalPages = Math.ceil(totalStadiums / pageSize);

    return NextResponse.json({
      stadiums,
      pagination: {
        currentPage: page,
        totalPages,
        totalStadiums,
        pageSize,
      },
    });
  } catch (error) {
    console.error("Stadiums fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 