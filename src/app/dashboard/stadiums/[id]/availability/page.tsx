import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AvailabilityManager from "@/components/stadiums/availability-manager";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function StadiumAvailabilityPage({ params }: PageProps) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Check if the user is a stadium owner
  if (session.user.role !== "STADIUM_OWNER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch the stadium
  const stadium = await prisma.stadium.findUnique({
    where: {
      id,
    },
    include: {
      availability: true,
    },
  });

  // Check if stadium exists
  if (!stadium) {
    redirect("/dashboard");
  }

  // Check if the user owns the stadium or is an admin
  if (stadium.ownerId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Extract days of week from existing availability
  const existingAvailability = stadium.availability.map(slot => ({
    id: slot.id,
    dayOfWeek: slot.dayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    isRecurring: slot.isRecurring,
    specificDate: slot.specificDate ? new Date(slot.specificDate).toISOString().split('T')[0] : null,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Availability</h1>
        <p className="mt-2 text-gray-600">
          Set the hours when your stadium is available for booking.
        </p>
      </div>
      
      <div className="bg-gray-800 text-white shadow rounded-lg p-6">
        <AvailabilityManager 
          stadiumId={stadium.id} 
          existingAvailability={existingAvailability} 
        />
      </div>
    </div>
  );
} 