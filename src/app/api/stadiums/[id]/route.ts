import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stadiumId = params.id;

    // Find the stadium by ID with related data
    const stadiumData = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: {
        images: true,
        availability: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!stadiumData) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Convert Decimal to plain number for serialization
    const stadium = {
      ...stadiumData,
      pricePerHour: parseFloat(stadiumData.pricePerHour.toString()),
      createdAt: stadiumData.createdAt.toISOString(),
      updatedAt: stadiumData.updatedAt.toISOString(),
    };

    return NextResponse.json(stadium);
  } catch (error) {
    console.error("Stadium fetch error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log("PUT request received for stadium ID:", params.id);
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      console.log("Unauthorized - no session or user");
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const stadiumId = params.id;
    let body;
    try {
      body = await request.json();
      console.log("Request body received:", JSON.stringify(body, null, 2));
    } catch (jsonError: unknown) {
      console.error("Error parsing request JSON:", jsonError);
      return NextResponse.json(
        { message: "Invalid JSON in request body", error: jsonError instanceof Error ? jsonError.message : "Invalid JSON" },
        { status: 400 }
      );
    }

    // Check if stadium exists and belongs to the user
    const existingStadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: {
        images: true,
      },
    });

    if (!existingStadium) {
      console.log("Stadium not found:", stadiumId);
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the stadium or an admin
    if (
      existingStadium.ownerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      console.log("Permission denied - user is not owner or admin:", session.user.id);
      return NextResponse.json(
        { message: "You don't have permission to update this stadium" },
        { status: 403 }
      );
    }

    // Extract updatable fields from the new form structure
    const {
      name,
      description,
      address,
      city,
      state,
      postalCode,
      country,
      latitude,
      longitude,
      pricePerHour,
      sportTypes,
      facilities,
      rules,
      capacity,
      contactPhone,
      contactEmail,
      images,
    } = body;

    // Debug what we're trying to update
    console.log("Updating stadium with:", {
      name,
      description: description?.substring(0, 20) + "...",
      address,
      pricePerHour,
      sportTypes,
      facilities,
      capacity,
      imageCount: images?.length,
    });

    try {
      // Update stadium with the new schema
      const updatedStadium = await prisma.stadium.update({
        where: { id: stadiumId },
        data: {
          name,
          description,
          address,
          city,
          state,
          postalCode,
          country,
          latitude,
          longitude,
          pricePerHour: parseFloat(pricePerHour.toString()),
          sportTypes,
          facilities,
          rules,
          capacity,
          contactPhone,
          contactEmail,
        },
        include: {
          images: true,
        },
      });
      console.log("Stadium updated successfully");
    } catch (prismaError: unknown) {
      console.error("Prisma error updating stadium:", prismaError);
      return NextResponse.json(
        { message: "Error updating stadium", error: prismaError instanceof Error ? prismaError.message : "Database error" },
        { status: 500 }
      );
    }

    // Handle image update
    if (images && Array.isArray(images)) {
      console.log("Processing image updates");
      // Get existing image URLs
      const existingImageUrls = existingStadium.images.map(img => img.url);
      
      // Find images to delete (in existing but not in new list)
      const imagesToDelete = existingStadium.images.filter(
        img => !images.includes(img.url)
      );
      
      console.log(`Found ${imagesToDelete.length} images to delete`);
      
      // Delete removed images
      if (imagesToDelete.length > 0) {
        try {
          await prisma.stadiumImage.deleteMany({
            where: {
              id: {
                in: imagesToDelete.map(img => img.id)
              }
            },
          });
          console.log("Deleted removed images successfully");
        } catch (deleteError: unknown) {
          console.error("Error deleting images:", deleteError);
          return NextResponse.json(
            { message: "Error deleting images", error: deleteError instanceof Error ? deleteError.message : "Image deletion error" },
            { status: 500 }
          );
        }
      }
      
      // Add new images that don't exist yet
      const newImageUrls = images.filter(url => !existingImageUrls.includes(url));
      console.log(`Found ${newImageUrls.length} new images to add`);
      
      if (newImageUrls.length > 0) {
        try {
          await prisma.stadiumImage.createMany({
            data: newImageUrls.map(url => ({
              url,
              stadiumId,
            })),
            skipDuplicates: true,
          });
          console.log("Added new images successfully");
        } catch (createError: unknown) {
          console.error("Error creating images:", createError);
          return NextResponse.json(
            { message: "Error creating images", error: createError instanceof Error ? createError.message : "Image creation error" },
            { status: 500 }
          );
        }
      }
    }

    // Get the updated stadium with fresh images
    const refreshedStadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
      include: {
        images: true,
      },
    });

    if (!refreshedStadium) {
      console.error("Could not find refreshed stadium after update");
      return NextResponse.json(
        { message: "Stadium was updated but could not be retrieved" },
        { status: 500 }
      );
    }

    // Convert for serialization
    const serializedStadium = {
      ...refreshedStadium,
      pricePerHour: parseFloat(refreshedStadium.pricePerHour.toString()),
      createdAt: refreshedStadium.createdAt.toISOString(),
      updatedAt: refreshedStadium.updatedAt.toISOString(),
    };

    console.log("Returning updated stadium successfully");
    return NextResponse.json(serializedStadium);
  } catch (error: unknown) {
    console.error("Stadium update error:", error);
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { message: "Internal server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const stadiumId = params.id;

    // Check if stadium exists and belongs to the user
    const existingStadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
    });

    if (!existingStadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Check if the user is the owner of the stadium or an admin
    if (
      existingStadium.ownerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "You don't have permission to delete this stadium" },
        { status: 403 }
      );
    }

    // Delete the stadium (cascades to related records)
    await prisma.stadium.delete({
      where: { id: stadiumId },
    });

    return NextResponse.json(
      { message: "Stadium deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stadium deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 