"use client";

import { useState, useEffect, useRef } from "react";
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
  const { user, signOut, loading: authLoading } = useAuth();
  const { courses, loading, error, createCourse } = useCourses(user?.id);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userEmail = user?.email || "";
  const userDisplayName = user?.user_metadata?.full_name || "";
  
  const getFirstName = (displayName: string, email: string) => {
    if (displayName) {
      return displayName.split(' ')[0];
    }
    if (email) {
      const username = email.split('@')[0];
      const firstName = username.split('.')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    return "User";
  };
  
  const firstName = getFirstName(userDisplayName, userEmail);
  const userInitial = firstName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
    try {
      await signOut();
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Sign out error:", error);
    }
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
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer group"
              >
                <div className="relative">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-105 flex-shrink-0">
                    {userInitial}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    Hello, {firstName}
                  </p>
                </div>
                <svg 
                  className={`w-4 h-4 text-gray-400 transition-all duration-200 group-hover:text-gray-600 ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className={`absolute right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-300 transform origin-top-right ${
                isProfileOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                {/* User Info Header */}
                <div className="px-5 py-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm flex-shrink-0">
                      {userInitial}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{firstName}</p>
                    </div>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium">View Profile</span>
                  </button>
                  
                  <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">Account Settings</span>
                  </button>
                  
                  <button className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-gray-50/80 hover:text-blue-600 transition-all duration-200 group cursor-pointer">
                    <svg className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Help & Support</span>
                  </button>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>
                
                {/* Sign Out */}
                <div className="py-2">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center px-5 py-3 text-red-600 hover:bg-red-50/80 transition-all duration-200 group cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-3 text-red-500 group-hover:text-red-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
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