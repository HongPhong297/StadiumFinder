"use client";

import { useState } from 'react';
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdatePassword() {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      toast.error("New passwords do not match.");
      return;
    }
    if (!currentPassword || !newPassword) {
        setError("Please fill in all password fields.");
        toast.error("Please fill in all password fields.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }

      toast.success("Password updated successfully!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error("Password update error:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>
      
      <div className="max-w-3xl space-y-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Notifications</CardTitle>
            <CardDescription className="text-gray-300">Control when and how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-white">Email Notifications</label>
                  <p className="text-sm text-gray-400">Receive booking confirmations and updates</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-white">Booking Reminders</label>
                  <p className="text-sm text-gray-400">Get reminded about upcoming bookings</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium text-white">Promotional Emails</label>
                  <p className="text-sm text-gray-400">Stay updated about special offers and new features</p>
                </div>
                <input type="checkbox" className="h-5 w-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-600 focus:ring-offset-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Account Security</CardTitle>
            <CardDescription className="text-gray-300">Manage your password and account security options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium text-white">Change Password</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-300">Current Password</label>
                    <input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-gray-300">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {error && <p className="text-sm text-red-400">{error}</p>}
                  <button
                    type="button"
                    onClick={handleUpdatePassword}
                    disabled={isLoading}
                    className="mt-2 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                       <>
                         <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                         Updating...
                       </>
                     ) : (
                       'Update Password'
                     )}
                  </button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-700">
                <h3 className="text-base font-medium text-red-400">Danger Zone</h3>
                <div className="mt-3">
                  <button
                    type="button"
                    className="bg-red-700 text-white border border-transparent px-4 py-2 rounded-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ring-offset-gray-800"
                  >
                    Delete Account
                  </button>
                  <p className="mt-2 text-sm text-gray-400">
                    Once you delete your account, all of your data will be permanently removed.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 