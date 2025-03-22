"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { format } from "date-fns";

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

interface StadiumOwnerDashboardProps {
  user: any;
  stadiums: Stadium[];
}

export default function StadiumOwnerDashboard({ user, stadiums }: StadiumOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"stadiums" | "bookings" | "analytics" | "profile">("stadiums");

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
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-black">
                    You don't have any booking requests yet.
                  </p>
                </div>
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