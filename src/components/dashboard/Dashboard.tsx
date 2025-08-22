"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCourses } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import AddCourseModal from "./AddCourseModal";
import Header from "./Header";
import Sidebar from "./Sidebar";
import CourseGrid from "./CourseGrid";
import PageHeader from "./PageHeader";
import LoadingSpinner from "../LoadingSpinner";
import { Class } from "@/lib/types/database";
import { ClassWithStats } from "@/lib/types/database";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("courses");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState<string | undefined>(undefined);
  const [filteredCourses, setFilteredCourses] = useState<ClassWithStats[]>([]);
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { courses, loading, error, createCourse, searchAllCourses, joinCourse, fetchCoursesByCollege } = useCourses(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <LoadingSpinner message="Loading..." size="md" />;
  }

  if (!user) {
    return null;
  }

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
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleNavChange = (navId: string) => {
    setActiveNav(navId);
    if (navId === "courses") {
      setSelectedCollege(undefined);
      setFilteredCourses([]);
    }
  };

  const handleCollegeSelect = async (collegeName: string) => {
    setSelectedCollege(collegeName);
    setActiveNav("colleges");
    
    try {
      const collegeCourses = await fetchCoursesByCollege(collegeName);
      setFilteredCourses(collegeCourses);
    } catch (error) {
      console.error('Error fetching courses by college:', error);
      setFilteredCourses([]);
    }
  };

  const handleShowAllCourses = () => {
    setSelectedCollege(undefined);
    setFilteredCourses([]);
    setActiveNav("courses");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        user={user}
        courses={courses}
        searchAllCourses={searchAllCourses}
        joinCourse={joinCourse}
        onSignOut={handleSignOut}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onCollegeSelect={handleCollegeSelect}
          selectedCollege={selectedCollege}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <PageHeader
              title={selectedCollege ? `${selectedCollege} Courses` : "My Courses"}
              subtitle={selectedCollege ? `Courses at ${selectedCollege}` : "Manage and access your enrolled courses"}
            />

            {/* Show All Courses Button when college is selected */}
            {selectedCollege && (
              <div className="mb-6">
                <button
                  onClick={handleShowAllCourses}
                  className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to your Courses
                </button>
              </div>
            )}

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CourseGrid
                courses={selectedCollege ? filteredCourses : courses}
                loading={loading}
                error={error}
                onCourseClick={handleCourseClick}
                onAddCourse={handleAddCourse}
              />
            </div>
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