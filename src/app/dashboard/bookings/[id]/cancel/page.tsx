import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
  
  // Fetch the booking with stadium details
  const booking = await prisma.booking.findUnique({
    where: {
      id: params.id,
    },
    include: {
      stadium: {
        select: {
          name: true,
        },
      },
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
  
  async function cancelBooking(formData: FormData) {
    "use server";
    
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return;
    }
    
    const booking = await prisma.booking.findUnique({
      where: {
        id: params.id,
      },
    });
    
    if (!booking) {
      return;
    }
    
    if (booking.userId !== session.user.id) {
      return;
    }
    
    if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
      return;
    }
    
    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: {
        id: params.id,
      },
      data: {
        status: "CANCELLED",
      },
    });
    
    redirect("/dashboard/bookings");
  }
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Cancel Booking</CardTitle>
          <CardDescription>
            You are about to cancel your booking for {booking.stadium.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-800 mb-4">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 text-amber-800 text-sm">
            Note: Cancellation policies may apply. Check the stadium's rules for details.
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => redirect("/dashboard/bookings")}>
            Go Back
          </Button>
          <form action={cancelBooking}>
            <Button variant="destructive" type="submit">
              Confirm Cancellation
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
} 