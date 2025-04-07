import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard/profile");
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-2">Manage your personal information</p>
      </div>
      
      <div className="max-w-3xl">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Personal Information</CardTitle>
            <CardDescription className="text-gray-300">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-1/3">
                  <label className="text-sm font-medium text-white">Profile Picture</label>
                </div>
                <div className="md:w-2/3 mt-2 md:mt-0">
                  <div className="flex items-center">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "Profile"}
                        className="h-16 w-16 rounded-full"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-600 flex items-center justify-center">
                        <span className="text-white font-medium text-xl">
                          {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="ml-5 bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-800"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-1/3">
                  <label className="text-sm font-medium text-white">Full Name</label>
                </div>
                <div className="md:w-2/3 mt-2 md:mt-0">
                  <input
                    type="text"
                    defaultValue={session.user.name || ""}
                    className="mt-1 block w-full border border-gray-600 rounded-md shadow-sm p-2 bg-gray-700 text-white placeholder:text-gray-400 focus:ring-blue-600 focus:border-blue-600 ring-offset-gray-800"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center">
                <div className="md:w-1/3">
                  <label className="text-sm font-medium text-white">Email Address</label>
                </div>
                <div className="md:w-2/3 mt-2 md:mt-0">
                  <input
                    type="email"
                    defaultValue={session.user.email || ""}
                    className="mt-1 block w-full border border-gray-700 rounded-md shadow-sm p-2 bg-gray-600 text-gray-300 cursor-not-allowed"
                    readOnly
                  />
                  <p className="mt-1 text-sm text-gray-400">Your email address cannot be changed</p>
                </div>
              </div>

              <div className="flex justify-end pt-5">
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ring-offset-gray-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 