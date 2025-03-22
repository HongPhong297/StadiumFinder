import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Get all stadiums
    const stadiums = await prisma.stadium.findMany();
    
    if (stadiums.length === 0) {
      return NextResponse.json(
        { message: "No stadiums found to add availability" },
        { status: 404 }
      );
    }

    // Clear existing availability data
    await prisma.availability.deleteMany({});
    
    // Create availability records for each stadium
    const createPromises = [];
    
    for (const stadium of stadiums) {
      // Create recurring availability for each day of the week
      // Monday to Sunday (1-7)
      for (let day = 0; day < 7; day++) {
        createPromises.push(
          // Morning slots
          prisma.availability.create({
            data: {
              stadiumId: stadium.id,
              dayOfWeek: day,
              startTime: "08:00",
              endTime: "10:00",
              isRecurring: true,
            },
          }),
          // Mid-day slots
          prisma.availability.create({
            data: {
              stadiumId: stadium.id,
              dayOfWeek: day,
              startTime: "12:00",
              endTime: "14:00",
              isRecurring: true,
            },
          }),
          // Evening slots
          prisma.availability.create({
            data: {
              stadiumId: stadium.id,
              dayOfWeek: day,
              startTime: "18:00",
              endTime: "20:00",
              isRecurring: true,
            },
          })
        );
      }
      
      // Add some specific date availability too
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      createPromises.push(
        prisma.availability.create({
          data: {
            stadiumId: stadium.id,
            specificDate: tomorrow,
            startTime: "15:00",
            endTime: "17:00",
            isRecurring: false,
            dayOfWeek: tomorrow.getDay(),
          },
        })
      );
    }
    
    await Promise.all(createPromises);
    
    return NextResponse.json({
      message: `Test availability data created for ${stadiums.length} stadiums`,
      stadiumCount: stadiums.length,
      availabilityCount: createPromises.length
    });
  } catch (error) {
    console.error("Error setting up test data:", error);
    return NextResponse.json(
      { message: "Failed to set up test data", error: String(error) },
      { status: 500 }
    );
  }
} 