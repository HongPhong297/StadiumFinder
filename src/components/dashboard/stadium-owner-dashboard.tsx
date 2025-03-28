"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

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

export default function StadiumOwnerDashboard({ user, stadiums, bookings }: StadiumOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stadiums" | "bookings" | "analytics" | "profile">("stadiums");

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
                <h2 className="text-xl font-semibold text-black mb-6">
                  Booking Requests
                </h2>
                
                {bookings.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-black">
                      You don't have any booking requests yet.
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
                          {bookings.map((booking) => (
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
                                    <button 
                                      className="text-green-600 hover:text-green-900"
                                      onClick={() => alert("Confirm booking functionality not implemented")}
                                    >
                                      Confirm
                                    </button>
                                    <button 
                                      className="text-red-600 hover:text-red-900"
                                      onClick={() => alert("Decline booking functionality not implemented")}
                                    >
                                      Decline
                                    </button>
                                  </div>
                                )}
                                {booking.specialRequests && (
                                  <button 
                                    className="text-blue-600 hover:text-blue-900 mt-1 block"
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
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">
                  Profile Settings
                </h2>
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="col-span-1">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-black"
                        >
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          defaultValue={user.name || ""}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Your business name"
                        />
                      </div>
                      <div className="col-span-1">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-black"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue={user.email}
                          disabled
                          className="mt-1 block w-full border border-gray-300 bg-gray-50 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="col-span-1">
                        <label
                          htmlFor="contactPhone"
                          className="block text-sm font-medium text-black"
                        >
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          name="contactPhone"
                          id="contactPhone"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Your contact phone number"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save Changes
                        </button>
                      </div>
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