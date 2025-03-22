import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Home, Calendar, UserCircle, Settings, LogOut, ExternalLink } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/signin?callbackUrl=/dashboard");
  }
  
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
    { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                Stadium Finder
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <Icon
                      className={`${
                        isActive ? "text-blue-500" : "text-gray-500 group-hover:text-gray-600"
                      } mr-3 flex-shrink-0 h-5 w-5`}
                    />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="pt-2 mt-2 border-t border-gray-200">
                <Link
                  href="/"
                  className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                >
                  <ExternalLink className="text-gray-500 group-hover:text-gray-600 mr-3 flex-shrink-0 h-5 w-5" />
                  Back to Main Site
                </Link>
                
                <form
                  action={async () => {
                    "use server";
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    <LogOut className="text-gray-500 group-hover:text-gray-600 mr-3 flex-shrink-0 h-5 w-5" />
                    Sign Out
                  </button>
                </form>
              </div>
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  {session.user.image ? (
                    <img
                      className="inline-block h-9 w-9 rounded-full"
                      src={session.user.image}
                      alt={session.user.name || "User avatar"}
                    />
                  ) : (
                    <div className="inline-block h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">
                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-700">
                    {session.user.role || "User"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors">
            Stadium Finder
          </Link>
          
          <details className="relative">
            <summary className="p-2 list-none cursor-pointer">
              <span className="sr-only">Open user menu</span>
              {session.user.image ? (
                <img
                  className="h-8 w-8 rounded-full"
                  src={session.user.image}
                  alt={session.user.name || "User avatar"}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </summary>
            <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t border-gray-100 mt-1 pt-1">
                <Link
                  href="/"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Back to Main Site
                </Link>
                
                <form
                  action={async () => {
                    "use server";
                    await signOut({ callbackUrl: "/" });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </details>
        </div>
      </div>
      
      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 