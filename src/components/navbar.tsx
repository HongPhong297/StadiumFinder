"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isStadiumOwner = session?.user?.role === "STADIUM_OWNER";
  const isAdmin = session?.user?.role === "ADMIN";
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Skip rendering the navbar on dashboard pages as they have their own navigation
  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isActiveLink = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center" onClick={closeMenus}>
              <span className="text-blue-600 font-bold text-xl">StadiumFinder</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-6">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActiveLink("/")
                    ? "border-blue-500 text-black"
                    : "border-transparent text-black hover:border-gray-300 hover:text-black"
                }`}
              >
                Home
              </Link>
              <Link
                href="/stadiums"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActiveLink("/stadiums")
                    ? "border-blue-500 text-black"
                    : "border-transparent text-black hover:border-gray-300 hover:text-black"
                }`}
              >
                Find Stadiums
              </Link>
              {isStadiumOwner && (
                <Link
                  href="/stadiums/new"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActiveLink("/stadiums/new")
                      ? "border-blue-500 text-black"
                      : "border-transparent text-black hover:border-gray-300 hover:text-black"
                  }`}
                >
                  Add Stadium
                </Link>
              )}
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActiveLink("/about")
                    ? "border-blue-500 text-black"
                    : "border-transparent text-black hover:border-gray-300 hover:text-black"
                }`}
              >
                About
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 items-center"
                    onClick={toggleUserMenu}
                  >
                    <span className="mr-2 text-black">
                      {session.user?.name || session.user?.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-black" />
                  </button>
                </div>
                {isUserMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={closeMenus}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={closeMenus}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-black hover:bg-gray-100"
                        onClick={closeMenus}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        closeMenus();
                        signOut({ callbackUrl: "/" });
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-black hover:text-black px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-black hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                isActiveLink("/")
                  ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                  : "border-l-4 border-transparent text-black hover:bg-gray-50 hover:border-gray-300 hover:text-black"
              }`}
              onClick={closeMenus}
            >
              Home
            </Link>
            <Link
              href="/stadiums"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                isActiveLink("/stadiums")
                  ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                  : "border-l-4 border-transparent text-black hover:bg-gray-50 hover:border-gray-300 hover:text-black"
              }`}
              onClick={closeMenus}
            >
              Find Stadiums
            </Link>
            {isStadiumOwner && (
              <Link
                href="/stadiums/new"
                className={`block pl-3 pr-4 py-2 text-base font-medium ${
                  isActiveLink("/stadiums/new")
                    ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                    : "border-l-4 border-transparent text-black hover:bg-gray-50 hover:border-gray-300 hover:text-black"
                }`}
                onClick={closeMenus}
              >
                Add Stadium
              </Link>
            )}
            <Link
              href="/about"
              className={`block pl-3 pr-4 py-2 text-base font-medium ${
                isActiveLink("/about")
                  ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700"
                  : "border-l-4 border-transparent text-black hover:bg-gray-50 hover:border-gray-300 hover:text-black"
              }`}
              onClick={closeMenus}
            >
              About
            </Link>
          </div>
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-grow">
                  <div className="text-base font-medium text-black">
                    {session.user?.name || "User"}
                  </div>
                  <div className="text-sm font-medium text-black">
                    {session.user?.email}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-base font-medium text-black hover:text-black hover:bg-gray-100"
                  onClick={closeMenus}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-black hover:text-black hover:bg-gray-100"
                  onClick={closeMenus}
                >
                  Profile
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-base font-medium text-black hover:text-black hover:bg-gray-100"
                    onClick={closeMenus}
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    closeMenus();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-black hover:text-black hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="mt-3 space-y-1">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-base font-medium text-black hover:text-black hover:bg-gray-100"
                  onClick={closeMenus}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 text-base font-medium text-black hover:bg-blue-100 bg-blue-600 text-white mx-4 my-2 py-2 px-4 rounded"
                  onClick={closeMenus}
                >
                  Register
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 