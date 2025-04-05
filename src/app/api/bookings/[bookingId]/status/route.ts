import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { BookingStatus } from '@prisma/client'; // Import enum

// Define allowed target statuses
const ALLOWED_STATUSES: BookingStatus[] = [BookingStatus.CONFIRMED, BookingStatus.CANCELLED];

export async function PATCH(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { bookingId } = params;
    const { status: newStatus } = await request.json();

    // 1. Authentication Check
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Validate Input Status
    if (!newStatus || !ALLOWED_STATUSES.includes(newStatus as BookingStatus)) {
        return NextResponse.json({ message: 'Invalid target status provided' }, { status: 400 });
    }

    // 3. Find Booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        status: true,
        stadium: {
          select: { ownerId: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    // 4. Authorization Check (Owner or Admin)
    const isOwner = booking.stadium.ownerId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // 5. Check if status transition is valid (e.g., can only confirm/decline PENDING)
    if (booking.status !== BookingStatus.PENDING) {
        return NextResponse.json(
            { message: `Booking status is already ${booking.status}, cannot change.` }, 
            { status: 400 }
        );
    }

    // 6. Update Status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus as BookingStatus,
      },
    });

    return NextResponse.json(updatedBooking);

  } catch (error) {
    console.error('Error updating booking status:', error);
    // Check for specific Prisma errors if needed
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 