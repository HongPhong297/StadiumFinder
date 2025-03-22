"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { z } from "zod";

interface BookingFormProps {
  stadiumId: string;
  pricePerHour: number;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const formSchema = z.object({
  date: z.date({
    required_error: "A date is required",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  endTime: z.string({
    required_error: "Please select an end time",
  }),
  specialRequests: z.string().optional(),
});

export default function BookingForm({ stadiumId, pricePerHour }: BookingFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(false);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [selectedEndTime, setSelectedEndTime] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);

  // Calculate total price
  useEffect(() => {
    if (selectedStartTime && selectedEndTime) {
      // Calculate duration in hours
      const start = new Date(`1970-01-01T${selectedStartTime}`);
      const end = new Date(`1970-01-01T${selectedEndTime}`);
      const durationMs = end.getTime() - start.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      // Calculate total price
      const price = Math.round(durationHours * pricePerHour * 100) / 100;
      setTotalPrice(price);
    } else {
      setTotalPrice(0);
    }
  }, [selectedStartTime, selectedEndTime, pricePerHour]);

  // Fetch available time slots when date changes
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimeSlots();
    }
  }, [selectedDate]);

  const fetchAvailableTimeSlots = async () => {
    if (!selectedDate) return;
    
    setIsLoadingTimeSlots(true);
    setError("");
    setAvailableTimeSlots([]);
    
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      console.log(`Fetching time slots for ${formattedDate}`);
      
      const response = await fetch(`/api/stadiums/${stadiumId}/availability?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch available time slots: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Availability data:", data);
      
      if (!data.availableSlots || data.availableSlots.length === 0) {
        setError("No available time slots for the selected date");
        return;
      }
      
      // Ensure we have the proper format for time slots
      const formattedSlots = data.availableSlots.map((slot: { startTime: string | Date; endTime: string | Date }) => ({
        startTime: typeof slot.startTime === 'string' ? slot.startTime : format(new Date(slot.startTime), 'HH:mm'),
        endTime: typeof slot.endTime === 'string' ? slot.endTime : format(new Date(slot.endTime), 'HH:mm')
      }));
      
      console.log("Formatted time slots:", formattedSlots);
      setAvailableTimeSlots(formattedSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      setError(`Failed to load available time slots: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoadingTimeSlots(false);
    }
  };

  // Generate time options from available slots
  const startTimeOptions = availableTimeSlots.map(slot => slot.startTime);
  
  // Only show end times that match with the selected start time
  const endTimeOptions = selectedStartTime 
    ? availableTimeSlots
        .filter(slot => slot.startTime === selectedStartTime)
        .map(slot => slot.endTime)
    : [];

  console.log("Start time options:", startTimeOptions);
  console.log("End time options:", endTimeOptions);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      setError("You must be logged in to make a booking");
      return;
    }
    
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      setError("Please complete all required fields");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const startDateTime = `${formattedDate}T${selectedStartTime}`;
      const endDateTime = `${formattedDate}T${selectedEndTime}`;
      
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stadiumId,
          startTime: startDateTime,
          endTime: endDateTime,
          totalPrice,
          specialRequests,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }
      
      // Success! Redirect to bookings page
      router.push("/dashboard/bookings");
    } catch (error: any) {
      console.error("Booking error:", error);
      setError(error.message || "Failed to create booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-black">Book This Stadium</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Date
          </label>
          <input 
            type="date"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null;
              setSelectedDate(date);
            }}
            className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm p-2 text-black" 
            min={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
        
        {selectedDate && !isLoadingTimeSlots && availableTimeSlots.length === 0 && (
          <div className="text-amber-700 text-sm p-2 bg-amber-50 rounded mb-4 border border-amber-200">
            No available time slots for the selected date. Please try another date.
          </div>
        )}
        
        {isLoadingTimeSlots ? (
          <div className="flex items-center justify-center h-12">
            <span className="text-sm text-gray-700">Loading available times...</span>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Start Time
              </label>
              <select
                value={selectedStartTime}
                onChange={(e) => {
                  setSelectedStartTime(e.target.value);
                  setSelectedEndTime(""); // Reset end time when start time changes
                }}
                disabled={!selectedDate || startTimeOptions.length === 0}
                className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm p-2 text-black"
              >
                <option value="" className="text-black">Select start time</option>
                {startTimeOptions.map((time) => (
                  <option key={time} value={time} className="text-black">
                    {time}
                  </option>
                ))}
              </select>
              {startTimeOptions.length === 0 && selectedDate && !isLoadingTimeSlots && (
                <p className="text-sm text-red-600 mt-1 font-medium">No available start times for the selected date</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                End Time
              </label>
              <select
                value={selectedEndTime}
                onChange={(e) => setSelectedEndTime(e.target.value)}
                disabled={!selectedStartTime || endTimeOptions.length === 0}
                className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm p-2 text-black"
              >
                <option value="" className="text-black">Select end time</option>
                {endTimeOptions.map((time) => (
                  <option key={time} value={time} className="text-black">
                    {time}
                  </option>
                ))}
              </select>
              {selectedStartTime && endTimeOptions.length === 0 && !isLoadingTimeSlots && (
                <p className="text-sm text-red-600 mt-1 font-medium">No available end times for the selected start time</p>
              )}
            </div>
          </>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm p-2 text-black"
            rows={3}
            placeholder="Any special requests or requirements"
          />
        </div>
        
        {totalPrice > 0 && (
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-blue-800 font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <button
          type="submit"
          disabled={!session || isLoading || !selectedDate || !selectedStartTime || !selectedEndTime}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Confirm Booking"}
        </button>
        
        {!session && (
          <p className="text-sm text-center text-gray-800 mt-2">
            Please <a href="/login" className="text-blue-700 font-semibold hover:underline">sign in</a> to book this stadium
          </p>
        )}
      </form>
    </div>
  );
} 