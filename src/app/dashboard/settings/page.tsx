import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/settings");
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-700 mt-2">Manage your account settings and preferences</p>
      </div>
      
      <div className="max-w-3xl space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription className="text-gray-700">Control when and how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium">Email Notifications</label>
                  <p className="text-sm text-gray-700">Receive booking confirmations and updates</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium">Booking Reminders</label>
                  <p className="text-sm text-gray-700">Get reminded about upcoming bookings</p>
                </div>
                <input type="checkbox" defaultChecked className="h-5 w-5" />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-base font-medium">Promotional Emails</label>
                  <p className="text-sm text-gray-700">Stay updated about special offers and new features</p>
                </div>
                <input type="checkbox" className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Security</CardTitle>
            <CardDescription className="text-gray-700">Manage your password and account security options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium">Change Password</h3>
                <div className="mt-3 space-y-4">
                  <div>
                    <label htmlFor="current-password" className="block text-sm font-medium">Current Password</label>
                    <input
                      id="current-password"
                      type="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium">New Password</label>
                    <input
                      id="new-password"
                      type="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium">Confirm New Password</label>
                    <input
                      id="confirm-password"
                      type="password"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                  </div>
                  <button
                    type="button"
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Update Password
                  </button>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-base font-medium text-red-600">Danger Zone</h3>
                <div className="mt-3">
                  <button
                    type="button"
                    className="bg-white text-red-600 border border-red-600 px-4 py-2 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Account
                  </button>
                  <p className="mt-2 text-sm text-gray-700">
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