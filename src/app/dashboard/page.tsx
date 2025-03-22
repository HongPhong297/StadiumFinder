import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import StadiumOwnerDashboard from "@/components/dashboard/stadium-owner-dashboard";
import UserDashboard from "@/components/dashboard/user-dashboard";

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

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  let ownedStadiums: DashboardStadium[] = [];

  if (session.user.role === "STADIUM_OWNER") {
    // Fetch stadiums owned by this user
    const stadiumsData = await prisma.stadium.findMany({
      where: {
        ownerId: session.user.id,
      },
      include: {
        images: {
          select: {
            url: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    // Explicitly convert the prisma result to our DashboardStadium interface
    ownedStadiums = stadiumsData.map(stadium => ({
      id: stadium.id,
      name: stadium.name,
      description: stadium.description || "",
      pricePerHour: Number(stadium.pricePerHour),
      city: stadium.city,
      createdAt: stadium.createdAt.toISOString(),
      images: stadium.images,
      _count: stadium._count
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {session.user.role === "STADIUM_OWNER" ? (
        <StadiumOwnerDashboard user={session.user} stadiums={ownedStadiums} />
      ) : (
        <UserDashboard user={session.user} />
      )}
    </div>
  );
} 