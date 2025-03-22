import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { stadiumId, date, startTime, endTime, totalPrice, specialRequests } = body;

    // Validate required fields
    if (!stadiumId || !startTime || !endTime || !totalPrice) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Parse dates from ISO strings
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(endTime);

    // Check if the stadium exists
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
    });

    if (!stadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        stadiumId,
        status: "CONFIRMED",
        OR: [
          {
            startTime: {
              lt: endDateTime,
            },
            endTime: {
              gt: startDateTime,
            },
          },
        ],
      },
    });

    if (overlappingBookings.length > 0) {
      return NextResponse.json(
        { message: "This time slot is already booked" },
        { status: 409 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        stadiumId,
        userId: session.user.id,
        startTime: startDateTime,
        endTime: endDateTime,
        totalPrice,
        specialRequests: specialRequests || "",
        status: "CONFIRMED",
        paymentStatus: "PENDING",
      },
      include: {
        stadium: {
          select: {
            name: true,
            address: true,
            city: true,
            postalCode: true,
          },
        },
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const stadiumId = searchParams.get("stadiumId");

    // Build query filters
    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (stadiumId) {
      where.stadiumId = stadiumId;
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            images: {
              take: 1,
            },
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 