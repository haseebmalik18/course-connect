import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-blue-50/20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl translate-y-40 -translate-x-40 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-radial from-blue-100/10 to-transparent rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      <div className="absolute top-0 left-1/4 w-px h-96 bg-gradient-to-b from-blue-200/20 via-blue-100/10 to-transparent"></div>
      <div className="absolute top-0 right-1/3 w-px h-80 bg-gradient-to-b from-blue-100/15 via-blue-50/5 to-transparent"></div>

      <div
        className="absolute top-40 right-20 w-3 h-3 bg-blue-200/30 rounded-full blur-sm animate-pulse"
        style={{ animationDuration: "4s" }}
      ></div>
      <div
        className="absolute bottom-40 left-16 w-2 h-2 bg-blue-300/25 rounded-full blur-sm animate-pulse"
        style={{ animationDelay: "2s", animationDuration: "5s" }}
      ></div>
      <nav className="sticky top-0 z-50 px-6 py-4 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-sm shadow-blue-100/50 animate-in slide-in-from-top duration-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-blue-600 hover:scale-105 transition-transform duration-300 cursor-pointer">
            CUNYConnect
          </h1>
          <div className="flex gap-3">
            <Link
              href="/auth"
              className="px-6 py-2.5 text-blue-600 hover:bg-blue-50 hover:scale-105 active:scale-95 rounded-full transition-all duration-300 font-medium hover:shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/auth"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 rounded-full transition-all duration-300 font-medium shadow-lg shadow-blue-200/50 hover:shadow-xl hover:shadow-blue-300/60"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative px-6 py-24 max-w-4xl mx-auto text-center">
        <h2 className="text-6xl font-light text-gray-900 mb-6 leading-tight animate-in fade-in slide-in-from-bottom duration-1000 delay-200">
          Connect with your
          <span className="block font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-500">
            CUNY community
          </span>
        </h2>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
          The platform where CUNY students share knowledge, find mentors, and
          succeed together.
        </p>
        <div className="animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
          <Link
            href="/auth"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60"
          >
            Join with CUNY Email
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      <section className="relative px-6 py-20 bg-gradient-to-b from-gray-50/80 to-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/20 hover:shadow-2xl hover:shadow-blue-100/20 hover:-translate-y-2 hover:bg-white/90 transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300/60 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Share Resources
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                Access study guides, notes, and materials from students in your
                courses.
              </p>
            </div>

            <div className="group bg-white/70 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-white/20 hover:shadow-2xl hover:shadow-blue-100/20 hover:-translate-y-2 hover:bg-white/90 transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300/60 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Find Mentors
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                Connect with students who&apos;ve succeeded in your courses for
                guidance.
              </p>
            </div>

            <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 cursor-pointer animate-in fade-in slide-in-from-bottom duration-1000 delay-700">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300/60 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
                <svg
                  className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                Verified Network
              </h3>
              <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                Secure community exclusively for verified CUNY students.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative px-6 py-24 bg-gradient-to-r from-blue-50/30 via-white to-blue-50/30">
        <div className="absolute top-12 left-1/2 w-32 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent -translate-x-1/2"></div>
        <div className="absolute bottom-12 left-1/2 w-24 h-px bg-gradient-to-r from-transparent via-blue-300/50 to-transparent -translate-x-1/2"></div>
        <div className="max-w-3xl mx-auto text-center animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <h3 className="text-4xl font-light text-gray-900 mb-6 hover:text-blue-600 transition-colors duration-500">
            Ready to get started?
          </h3>
          <p className="text-xl text-gray-600 mb-10 hover:text-gray-700 transition-colors duration-300">
            Join the community and transform your academic experience.
          </p>
          <Link
            href="/auth"
            className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60"
          >
            <span className="group-hover:scale-105 transition-transform duration-300">
              Sign Up Now
            </span>
            <svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="relative px-6 py-8 border-t border-white/20 bg-gradient-to-t from-gray-50/50 to-white/90 backdrop-blur-sm animate-in fade-in duration-1000 delay-800">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500 text-sm hover:text-gray-600 transition-colors duration-300">
            © 2025 CUNYConnect • Built for students, by students
          </p>
        </div>
      </footer>
    </div>
  );
}
