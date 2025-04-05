import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import StadiumOwnerDashboard from "@/components/dashboard/stadium-owner-dashboard";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

// Changed interface name to avoid conflicts with other Stadium types
interface DashboardStadium {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  city: string;
  createdAt: string;
  images: { url: string }[];
  _count: {
    bookings: number;
  };
}

interface BookingWithDetails {
  id: string;
  startTime: Date;
  endTime: Date;
  totalPrice: string;
  status: string;
  specialRequests: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  stadium: {
    id: string;
    name: string;
    address: string;
    images: { url: string }[];
  };
}

interface Booking {
  // Define a simple booking type for props
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  totalPrice: string;
  stadium: {
    name: string;
  };
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const isStadiumOwner = session.user.role === "STADIUM_OWNER";
  let ownedStadiums: any[] = [];
  let stadiumBookings: any[] = [];
  let userBookings: Booking[] = []; // Initialize user bookings array

  if (isStadiumOwner) {
    // Fetch data for stadium owner
    const rawOwnedStadiums = await prisma.stadium.findMany({ // Renamed temp variable
      where: { ownerId: session.user.id },
      include: {
        images: { take: 1 },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert Decimal pricePerHour to string/number
    ownedStadiums = rawOwnedStadiums.map(stadium => ({
      ...stadium,
      pricePerHour: stadium.pricePerHour.toString(), // Convert Decimal
    }));

    const stadiumIds = ownedStadiums.map(s => s.id);
    const rawStadiumBookings = await prisma.booking.findMany({ // Renamed temp variable
        where: { stadiumId: { in: stadiumIds } },
        include: { user: true, stadium: { include: { images: { take: 1 }}}}, 
        orderBy: { startTime: 'desc' }
    });

    // Convert Decimal totalPrice and nested stadium.pricePerHour to string
    stadiumBookings = rawStadiumBookings.map(booking => ({
        ...booking,
        totalPrice: booking.totalPrice.toString(), // Convert booking total price
        stadium: {
            ...booking.stadium,
            pricePerHour: booking.stadium.pricePerHour.toString(), // Convert nested stadium price
        }
    }));

  } else {
    // Fetch data for regular user
    const rawUserBookings = await prisma.booking.findMany({ // Renamed temp variable
      where: { userId: session.user.id },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        totalPrice: true, // Still fetch the Decimal
        stadium: {
          select: { name: true }
        }
      },
      orderBy: { startTime: 'desc' },
      // Optionally limit the number shown on the dashboard, e.g., take: 5
    });

    // Convert Decimal to string before passing to client component
    userBookings = rawUserBookings.map(booking => ({
      ...booking,
      totalPrice: booking.totalPrice.toString(),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isStadiumOwner ? (
        <StadiumOwnerDashboard 
          user={session.user} 
          stadiums={ownedStadiums} 
          bookings={stadiumBookings} // Pass stadium bookings
        />
      ) : (
        <UserDashboard 
          user={session.user} 
          bookings={userBookings} // Pass user bookings
        />
      )}
    </div>
  );
} 