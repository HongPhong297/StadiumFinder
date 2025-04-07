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
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-gray-900">Cancel Booking</CardTitle>
        <CardDescription className="text-gray-600">
          You are about to cancel your booking for {booking.stadium.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">
          Are you sure you want to cancel this booking? This action cannot be undone.
        </p>
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-900 text-sm">
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
        <Button variant="outline" onClick={handleGoBack} className="text-gray-700 border-gray-300 hover:bg-gray-100">
          Go Back
        </Button>
        <form action={cancelAction}>
          <Button 
            variant="destructive" 
            type="submit" 
            disabled={!canCancel}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Confirm Cancellation
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 