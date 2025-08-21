"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import AddCourseModal from "./AddCourseModal";
import { Class } from "@/lib/types/database";


export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("courses");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const { courses, loading, error, createCourse } = useCourses(user?.id);

  const filteredCourses = courses.filter(course => {
    const courseCode = `${course.class_subject} ${course.class_number}`;
    return courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
           course.college_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`);
  };

  const handleAddCourse = () => {
    setIsAddCourseModalOpen(true);
  };

  const handleCreateCourse = async (courseData: Partial<Class>) => {
    const result = await createCourse(courseData);
    if (result) {
      setIsAddCourseModalOpen(false);
    }
  };

  const handleSignOut = async () => {
    console.log("Sign out clicked");
    // Add Supabase sign out logic here
    router.push("/");
  };

  const navItems = [
    { id: "courses", label: "My Courses", icon: "📚" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "materials", label: "Materials", icon: "📁" },
    { id: "mentors", label: "Mentors", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
              <h1 className="ml-2 lg:ml-0 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                CourseConnect
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</a>
                  <a href="#" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Account Settings</a>
                  <hr className="my-1" />
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] fixed lg:sticky top-16 z-30`}>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeNav === item.id
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <p className="text-gray-600 mt-1">Manage and access your enrolled courses</p>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Loading State */}
              {loading && (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading courses...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="col-span-full text-center py-12">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-red-600 font-medium">Error loading courses</p>
                  <p className="text-gray-600 text-sm">{error}</p>
                </div>
              )}

              {/* Course Cards */}
              {!loading && !error && filteredCourses.map((course) => {
                const colors = [
                  "from-green-400 to-green-600",
                  "from-blue-400 to-blue-600", 
                  "from-purple-400 to-purple-600",
                  "from-orange-400 to-orange-600",
                  "from-pink-400 to-pink-600",
                  "from-red-400 to-red-600",
                  "from-yellow-400 to-yellow-600",
                  "from-indigo-400 to-indigo-600"
                ];
                const colorIndex = parseInt(course.class_id) % colors.length;
                const color = colors[colorIndex];

                return (
                  <div
                    key={course.class_id}
                    onClick={() => handleCourseClick(course.class_id)}
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
                  >
                    <div className={`h-2 w-full bg-gradient-to-r ${color} rounded-full mb-4 group-hover:shadow-md transition-all`}></div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{course.class_subject} {course.class_number}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.college_name}</p>
                    
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span>{course.member_count || 0} members</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span>{course.document_count || 0} files</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Course Card */}
              <div
                onClick={handleAddCourse}
                className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 flex flex-col items-center justify-center min-h-[200px]"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors mb-3">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-gray-600 font-medium group-hover:text-blue-600">Add New Course</span>
              </div>
            </div>

            {/* Empty State (if no courses found) */}
            {!loading && !error && filteredCourses.length === 0 && courses.length > 0 && (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses match your search</h3>
                <p className="text-gray-600">Try adjusting your search terms or add a new course.</p>
              </div>
            )}

            {/* No Courses State */}
            {!loading && !error && courses.length === 0 && (
              <div className="col-span-full text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
                <p className="text-gray-600">Get started by adding your first course.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Add Course Modal */}
      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
        loading={loading}
      />
    </div>
  );
}