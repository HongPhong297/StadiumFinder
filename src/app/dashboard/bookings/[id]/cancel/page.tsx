import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { differenceInHours } from 'date-fns';
import { CancelBookingCard } from '@/components/bookings/cancel-booking-card';

interface CancelBookingPageProps {
  params: {
    id: string;
  };
}

export default async function CancelBookingPage({ params }: CancelBookingPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/bookings");
  }
  
  // Fetch the booking (select fields needed by client component)
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    select: { 
      id: true,
      userId: true,
      startTime: true, 
      status: true, 
      stadium: { select: { name: true } } 
    },
  });
  
  // If booking doesn't exist or doesn't belong to the user, redirect
  if (!booking || booking.userId !== session.user.id) {
    redirect("/dashboard/bookings");
  }
  
  // If booking is already cancelled or completed, redirect
  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    redirect("/dashboard/bookings");
  }
  
  // Calculate if cancellation is allowed
  const now = new Date();
  const hoursUntilBooking = differenceInHours(booking.startTime, now);
  const canCancel = hoursUntilBooking >= 8;
  
  // Define the server action (signature updated previously)
  async function cancelBooking(formData: FormData): Promise<void> { 
    "use server";
    
    // Re-fetch session and booking inside the action for security
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error("Cancellation failed: Authentication required.");
      return; // Return void
    }
    
    const bookingToCancel = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { userId: true, status: true, startTime: true } // Select only needed fields
    });
    
    if (!bookingToCancel) {
      console.error("Cancellation failed: Booking not found.");
      return; // Return void
    }
    
    if (bookingToCancel.userId !== session.user.id) {
      console.error("Cancellation failed: Permission denied.");
      return; // Return void
    }
    
    if (bookingToCancel.status === "CANCELLED" || bookingToCancel.status === "COMPLETED") {
       console.error("Cancellation failed: Booking cannot be cancelled.");
      return; // Return void
    }

    // Add the cancellation time check
    const hoursDifference = differenceInHours(bookingToCancel.startTime, new Date());
    if (hoursDifference < 8) {
        console.error(`Cancellation attempt failed: Booking starts in ${hoursDifference} hours. Cancellation window is 8 hours.`);
       return; // Return void
    }
    
    // Update booking status to CANCELLED
    try {
      await prisma.booking.update({
        where: {
          id: params.id,
          userId: session.user.id,
        },
        data: {
          status: "CANCELLED",
        },
      });
    } catch (error) {
        console.error("Failed to update booking status:", error);
        return; // Return void on DB error
    }
    
    // No error, redirect
    redirect("/dashboard/bookings?status=cancelled");
  }
  
  // Prepare a simplified booking object for the client component prop
  const bookingForClient = {
      id: booking.id,
      stadium: { name: booking.stadium.name }
      // Add other display fields if needed
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      {/* Render the Client Component, passing props */}
      <CancelBookingCard 
        booking={bookingForClient} 
        canCancel={canCancel} 
        cancelAction={cancelBooking} 
      />
    </div>
  );
} 