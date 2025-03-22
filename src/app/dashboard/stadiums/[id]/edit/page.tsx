import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import EditStadiumForm from "@/components/stadiums/edit-stadium-form";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditStadiumPage({ params }: PageProps) {
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
      images: true,
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

  // Convert Decimal to number for serializability
  const serializedStadium = {
    ...stadium,
    pricePerHour: parseFloat(stadium.pricePerHour.toString()),
    createdAt: stadium.createdAt.toISOString(),
    updatedAt: stadium.updatedAt.toISOString(),
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black">Edit Stadium</h1>
        <p className="mt-2 text-black">
          Update your stadium information and amenities.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <EditStadiumForm stadium={serializedStadium} />
      </div>
    </div>
  );
} 