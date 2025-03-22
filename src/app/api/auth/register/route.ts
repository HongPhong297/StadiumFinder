import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Define the enum locally
type UserRole = "USER" | "STADIUM_OWNER" | "ADMIN";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    console.log("Registration request:", { name, email, role });

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log("Registration failed: Email already in use");
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    // Simplify to direct string assignment
    const userRole = role === "STADIUM_OWNER" ? "STADIUM_OWNER" : "USER";
    console.log("Setting user role to:", userRole);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });

    console.log("User created successfully:", { id: user.id, email: user.email, role: user.role });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
} 