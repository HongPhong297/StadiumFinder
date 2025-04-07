"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Booking {
  id: string;
  startTime: Date;
  endTime: Date;
  status: string;
  totalPrice: string;
  stadium: {
    name: string;
  };
}

interface UserDashboardProps {
  user: any;
  bookings: Booking[];
}

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

export function UserDashboard({ user, bookings }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "favorites" | "profile">("bookings");
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user.name || "");

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">StadiumFinder</h1>
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.name || user.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("bookings")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "bookings"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                My Bookings
              </button>
              <button
                onClick={() => setActiveTab("favorites")}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "favorites"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-black hover:text-black hover:border-gray-300"
                }`}
              >
                Favorite Stadiums
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
            {activeTab === "bookings" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-black">
                    My Bookings
                  </h2>
                  <Link
                    href="/stadiums"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Find Stadiums
                  </Link>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-black mb-4">
                      You don't have any bookings yet.
                    </p>
                    <Link
                      href="/stadiums"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Explore Stadiums
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {bookings.map((booking) => (
                      <li key={booking.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-gray-800">{booking.stadium.name}</p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.startTime), "EEE, MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {format(new Date(booking.startTime), "p")} - {format(new Date(booking.endTime), "p")}
                          </p>
                          <p className="text-sm text-gray-600">
                             Total: ${parseFloat(booking.totalPrice).toFixed(2)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "favorites" && (
              <div>
                <h2 className="text-xl font-semibold text-black mb-6">
                  Favorite Stadiums
                </h2>
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-black mb-4">
                    You haven't added any stadiums to your favorites yet.
                  </p>
                  <Link
                    href="/stadiums"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Explore Stadiums
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Profile Settings
                </h2>
                <p className="text-white mb-6">Manage your personal information</p>
                <div className="bg-gray-800 shadow rounded-lg border border-gray-700">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="col-span-1">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm py-2 px-3 bg-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="col-span-1">
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-white"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          defaultValue={user.email}
                          disabled
                          className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm py-2 px-3 bg-gray-600 text-gray-300 cursor-not-allowed focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <p className="mt-1 text-sm text-gray-400">Your email address cannot be changed</p>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={isLoading}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
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