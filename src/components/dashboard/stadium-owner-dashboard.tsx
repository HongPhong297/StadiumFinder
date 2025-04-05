"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookingStatus } from '@prisma/client';

type Stadium = {
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  city: string;
  images: { url: string }[];
  createdAt: string;
  _count: {
    bookings: number;
  };
};

type Booking = {
  id: string;
  startTime: Date;
  endTime: Date;
  totalPrice: string;
  status: string;
  specialRequests: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  stadium: {
    id: string;
    name: string;
    address: string;
    images: { url: string }[];
  };
};

interface StadiumOwnerDashboardProps {
  user: any;
  stadiums: Stadium[];
  bookings: Booking[];
}

// Define possible status filters including 'ALL'
const statusFilterOptions = ['ALL', ...Object.values(BookingStatus)];
type StatusFilter = 'ALL' | BookingStatus;

export default function StadiumOwnerDashboard({ user, stadiums: initialStadiums, bookings: initialBookings }: StadiumOwnerDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"stadiums" | "bookings" | "analytics" | "profile">("stadiums");
  const [bookings, setBookings] = useState(initialBookings);
  const [stadiums, setStadiums] = useState(initialStadiums);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  // --- State for status filter ---
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');

  // Function to get appropriate status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // --- Function to handle status update ---
  async function handleUpdateBookingStatus(bookingId: string, newStatus: "CONFIRMED" | "CANCELLED") {
    setUpdatingBookingId(bookingId); // Set loading state for this specific booking
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Failed to ${newStatus === 'CONFIRMED' ? 'confirm' : 'decline'} booking`);
      }

      toast.success(`Booking ${newStatus === 'CONFIRMED' ? 'confirmed' : 'cancelled'} successfully!`);
      
      // Update local state to reflect the change immediately
      setBookings(prevBookings => 
        prevBookings.map(b => 
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      
      // Optionally refresh server data if needed, though local update is faster UX
      // router.refresh(); 

    } catch (error: any) {
      console.error("Error updating booking status:", error);
      toast.error(error.message || "An error occurred.");
    } finally {
      setUpdatingBookingId(null); // Clear loading state
    }
  }

  // --- Filter bookings based on selected status ---
  const filteredBookings = useMemo(() => {
    if (selectedStatus === 'ALL') {
      return bookings;
    }
    return bookings.filter(booking => booking.status === selectedStatus);
  }, [bookings, selectedStatus]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("stadiums")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "stadiums"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                My Stadiums
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                Booking Requests
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                Profile Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "stadiums" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-black">
                    My Stadiums
                  </h2>
                  <Link
                    href="/stadiums/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Add New Stadium
                  </Link>
                </div>

                {stadiums.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-black mb-4">
                      You haven't added any stadiums yet.
                    </p>
                    <Link
                      href="/stadiums/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Your First Stadium
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stadiums.map((stadium) => (
                      <div key={stadium.id} className="bg-white border rounded-lg shadow overflow-hidden">
                        <div className="h-40 bg-gray-200 relative">
                          {stadium.images && stadium.images.length > 0 ? (
                            <img
                              src={stadium.images[0].url}
                              alt={stadium.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-black">
                              No Image
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-black truncate">{stadium.name}</h3>
                          <p className="text-black">{stadium.city}</p>
                          <div className="mt-2 flex justify-between">
                            <span className="text-black">${parseFloat(stadium.pricePerHour.toString()).toFixed(2)}/hr</span>
                            <span className="text-black">{stadium._count.bookings} bookings</span>
                          </div>
                          <div className="mt-4 flex space-x-2">
                            <Link 
                              href={`/stadiums/${stadium.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View
                            </Link>
                            <Link 
                              href={`/dashboard/stadiums/${stadium.id}/edit`}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              Edit
                            </Link>
                            <Link 
                              href={`/dashboard/stadiums/${stadium.id}/availability`}
                              className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            >
                              Set Availability
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-black">
                    Booking Requests
                  </h2>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Filter by Status:</label>
                    <Select 
                      value={selectedStatus}
                      onValueChange={(value) => setSelectedStatus(value as StatusFilter)}
                    >
                      <SelectTrigger id="status-filter" className="w-[180px]">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusFilterOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {status === 'ALL' ? 'All Statuses' : status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {filteredBookings.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-black">
                      {selectedStatus === 'ALL' 
                        ? "You don't have any booking requests yet."
                        : `No bookings found with status: ${selectedStatus}` }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stadium
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {booking.stadium.images && booking.stadium.images.length > 0 ? (
                                      <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={booking.stadium.images[0].url}
                                        alt={booking.stadium.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                        No img
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {booking.stadium.name}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{booking.user.name}</div>
                                <div className="text-sm text-gray-500">{booking.user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {format(new Date(booking.startTime), "MMM dd, yyyy")}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">${parseFloat(booking.totalPrice.toString()).toFixed(2)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {booking.status === "PENDING" && (
                                  <div className="flex space-x-2">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-green-600 hover:text-green-900 hover:bg-green-50 px-1 py-0 h-auto disabled:opacity-50"
                                      onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                                      disabled={updatingBookingId === booking.id}
                                    >
                                      {updatingBookingId === booking.id ? '...' : 'Confirm'}
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-red-600 hover:text-red-900 hover:bg-red-50 px-1 py-0 h-auto disabled:opacity-50"
                                      onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                                      disabled={updatingBookingId === booking.id}
                                    >
                                      {updatingBookingId === booking.id ? '...' : 'Decline'}
                                    </Button>
                                  </div>
                                )}
                                {booking.specialRequests && (
                                  <button 
                                    className="text-blue-600 hover:text-blue-900 mt-1 block text-xs"
                                    onClick={() => alert(`Special requests: ${booking.specialRequests}`)}
                                  >
                                    View requests
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">
                  Analytics
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-black">
                    Add stadiums to see booking analytics and insights.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Profile Settings
                </h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Business Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        defaultValue={user.name || ""}
                        className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800"
                        placeholder="Your business name"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        defaultValue={user.email || ""}
                        disabled
                        className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm p-2 bg-gray-600 text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-gray-400">Your email address cannot be changed.</p>
                    </div>

                    <div className="sm:col-span-6">
                      <label
                        htmlFor="contactPhone"
                        className="block text-sm font-medium text-gray-300"
                      >
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        name="contactPhone"
                        id="contactPhone"
                        defaultValue={user.contactPhone || ""}
                        className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800"
                        placeholder="Your contact phone number"
                      />
                    </div>
                  </div>
                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-800"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 