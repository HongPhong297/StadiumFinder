import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <div className="max-w-5xl w-full flex flex-col items-center justify-center text-center py-12 px-4 sm:px-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to StadiumFinder
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl">
          Connect with stadium owners and book your perfect venue for sports,
          events, or any occasion.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/login" 
            className="px-6 py-3 bg-white text-blue-700 hover:bg-blue-100 transition-colors rounded-md font-semibold text-lg"
          >
            Sign In
          </Link>
          <Link 
            href="/register" 
            className="px-6 py-3 bg-transparent border-2 border-white hover:bg-white hover:text-blue-700 transition-colors rounded-md font-semibold text-lg"
          >
            Create an Account
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold mb-3">Find Stadiums</h3>
            <p className="text-white/80">
              Search and filter by location, sport type, price, and available times.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold mb-3">Book Instantly</h3>
            <p className="text-white/80">
              Secure your venue with our simple booking system and payment process.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-all">
            <h3 className="text-xl font-semibold mb-3">Stadium Owners</h3>
            <p className="text-white/80">
              List your venue, manage bookings, and grow your business.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
