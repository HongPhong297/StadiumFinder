'use client';

import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  stadium: {
    name: string;
  };
  // Add other fields if needed for display
}

interface CancelBookingCardProps {
  booking: Booking;
  canCancel: boolean;
  cancelAction: (formData: FormData) => Promise<void>;
}

export function CancelBookingCard({ booking, canCancel, cancelAction }: CancelBookingCardProps) {
  // Client-side handler for the Go Back button
  const handleGoBack = () => {
    redirect('/dashboard/bookings');
  };

  return (
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

        {/* Display message if cancellation window passed */}
        {!canCancel && (
          <p className="text-red-600 font-semibold mt-4">
            This booking cannot be cancelled as it is less than 8 hours away.
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGoBack}> {/* Use client-side handler */}
          Go Back
        </Button>
        <form action={cancelAction}> {/* Pass server action to form */}
          <Button variant="destructive" type="submit" disabled={!canCancel}>
            Confirm Cancellation
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 