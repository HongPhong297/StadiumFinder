import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(
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
    const body = await request.json();
    const { url } = body;

    // Check if stadium exists and belongs to the user
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
    });

    if (!stadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Check if user owns the stadium or is admin
    if (
      stadium.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "You don't have permission to add images to this stadium" },
        { status: 403 }
      );
    }

    // Validate image URL
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "Valid image URL is required" },
        { status: 400 }
      );
    }

    // Create new image
    const image = await prisma.image.create({
      data: {
        url,
        stadiumId,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
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
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { message: "Image ID is required" },
        { status: 400 }
      );
    }

    // Check if stadium exists and belongs to the user
    const stadium = await prisma.stadium.findUnique({
      where: { id: stadiumId },
    });

    if (!stadium) {
      return NextResponse.json(
        { message: "Stadium not found" },
        { status: 404 }
      );
    }

    // Check if user owns the stadium or is admin
    if (
      stadium.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { message: "You don't have permission to delete images from this stadium" },
        { status: 403 }
      );
    }

    // Check if image exists and belongs to the stadium
    const image = await prisma.image.findUnique({
      where: { id: imageId },
    });

    if (!image || image.stadiumId !== stadiumId) {
      return NextResponse.json(
        { message: "Image not found or doesn't belong to this stadium" },
        { status: 404 }
      );
    }

    // Delete the image
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json(
      { message: "Image deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Image deletion error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 