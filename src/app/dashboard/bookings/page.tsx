import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function BookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/bookings");
  }
  
  // Fetch user's bookings
  const bookings = await prisma.booking.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      stadium: {
        select: {
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
      startTime: 'desc',
    },
  });
  
  // Function to get appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-200 text-green-900 font-medium";
      case "PENDING":
        return "bg-yellow-200 text-yellow-900 font-medium";
      case "CANCELLED":
        return "bg-red-200 text-red-900 font-medium";
      case "COMPLETED":
        return "bg-blue-200 text-blue-900 font-medium";
      default:
        return "bg-gray-200 text-gray-900 font-medium";
    }
  };
  
  // Function to format the date and time
  const formatDateTime = (date: Date) => {
    return format(new Date(date), "PPP p"); // "Apr 29, 2023, 5:30 PM"
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your stadium bookings</p>
      </div>
      
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <h3 className="text-xl font-medium text-white mb-4">No bookings found</h3>
          <p className="text-gray-300 mb-6">You haven't made any bookings yet.</p>
          <a href="/stadiums" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Find Stadiums
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden bg-gray-800 border-gray-700">
              <div className="relative h-48 w-full bg-gray-700">
                {booking.stadium.images[0] ? (
                  <img 
                    src={booking.stadium.images[0].url} 
                    alt={booking.stadium.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-gray-700">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className={`${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-white">{booking.stadium.name}</CardTitle>
                <CardDescription className="text-gray-300">
                  {booking.stadium.address}, {booking.stadium.city}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Date</span>
                    <span className="text-sm font-medium text-white">
                      {format(new Date(booking.startTime), "PPP")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Time</span>
                    <span className="text-sm font-medium text-white">
                      {format(new Date(booking.startTime), "p")} - {format(new Date(booking.endTime), "p")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-300">Total Price</span>
                    <span className="text-sm font-medium text-white">
                      ${parseFloat(booking.totalPrice.toString()).toFixed(2)}
                    </span>
                  </div>
                  
                  {booking.status === "PENDING" && (
                    <div className="flex justify-end mt-4">
                      <a 
                        href={`/dashboard/bookings/${booking.id}/cancel`}
                        className="text-sm text-red-400 hover:text-red-300 font-medium"
                      >
                        Cancel Booking
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 