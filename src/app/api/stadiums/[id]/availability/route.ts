import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface AvailabilitySlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate: string | null;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  [key: string]: any; // For other booking properties we might not need
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    
    if (!date) {
      return NextResponse.json(
        { message: "Date parameter is required" },
        { status: 400 }
      );
    }

    const stadiumId = params.id;
    
    // Check if stadium exists
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: {
        availability: true,
      },
    });

    if (!stadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
    
    console.log(`Processing availability for stadium ${stadiumId}, date ${date}, day of week ${dayOfWeek}`);
    
    // Get recurring availability for this day of week
    const recurringAvailability = stadium.availability.filter(
      (slot: any) => slot.isRecurring && slot.dayOfWeek === dayOfWeek
    );
    
    console.log(`Found ${recurringAvailability.length} recurring slots for day ${dayOfWeek}`);
    
    // Get specific availability for this date
    const specificAvailability = stadium.availability.filter(
      (slot: any) => {
        if (!slot.isRecurring && slot.specificDate) {
          const slotDate = new Date(slot.specificDate);
          return slotDate.toDateString() === selectedDate.toDateString();
        }
        return false;
      }
    );
    
    console.log(`Found ${specificAvailability.length} specific slots for date ${date}`);
    
    // Combine available time slots
    const availableSlots = [...recurringAvailability, ...specificAvailability].map(
      (slot: any) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
      })
    );

    console.log(`Total available slots: ${availableSlots.length}`);
    
    if (availableSlots.length === 0) {
      console.log("No availability found for this date");
    }

    // Get bookings for this date to check which slots are already booked
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const existingBookings = await prisma.booking.findMany({
      where: {
        stadiumId,
        status: { in: ["CONFIRMED", "PENDING"] },
        startTime: {
          gte: startOfDay,
        },
        endTime: {
          lte: endOfDay,
        },
      },
    });
    
    console.log(`Found ${existingBookings.length} existing bookings for date ${date}`);
    
    // Convert bookings to booked slots
    const bookedSlots = existingBookings.map((booking: Booking) => ({
      startTime: format(booking.startTime, "HH:mm"),
      endTime: format(booking.endTime, "HH:mm"),
    }));

    // Sort time slots by start time
    availableSlots.sort((a: TimeSlot, b: TimeSlot) => {
      const aTime = new Date(`1970-01-01T${a.startTime}`);
      const bTime = new Date(`1970-01-01T${b.startTime}`);
      return aTime.getTime() - bTime.getTime();
    });
    
    bookedSlots.sort((a: TimeSlot, b: TimeSlot) => {
      const aTime = new Date(`1970-01-01T${a.startTime}`);
      const bTime = new Date(`1970-01-01T${b.startTime}`);
      return aTime.getTime() - bTime.getTime();
    });

    return NextResponse.json({
      date,
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    console.error("Stadium availability error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const stadiumId = params.id;
    
    // Check if stadium exists and user owns it
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      select: { 
        id: true,
        ownerId: true
      },
    });

    if (!stadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner or an admin
    if (stadium.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "You don't have permission to update this stadium's availability" },
        { status: 403 }
      );
    }
    
    const { recurringSlots, specificSlots } = await request.json();
    
    // Validate the input
    if (!Array.isArray(recurringSlots) || !Array.isArray(specificSlots)) {
      return NextResponse.json(
        { message: "Invalid input format" },
        { status: 400 }
      );
    }
    
    // Delete existing availability
    await prisma.availability.deleteMany({
      where: {
        stadiumId,
      },
    });
    
    // Prepare slots for database
    const allSlots = [
      ...recurringSlots.map(slot => ({
        stadiumId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: true,
        specificDate: null,
      })),
      ...specificSlots.map(slot => ({
        stadiumId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: false,
        specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
      })),
    ];
    
    // Create new availability slots
    await prisma.availability.createMany({
      data: allSlots,
    });
    
    return NextResponse.json({
      message: "Availability updated successfully",
      recurringCount: recurringSlots.length,
      specificCount: specificSlots.length,
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
} 