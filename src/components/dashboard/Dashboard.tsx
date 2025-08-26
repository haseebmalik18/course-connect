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
      setFilteredCourses([]);
    }
  };

  const handleShowAllCourses = () => {
    setSelectedCollege(undefined);
    setFilteredCourses([]);
    setActiveNav("courses");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/30 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-blue-200/30 via-blue-100/20 to-transparent rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-r from-indigo-200/25 via-purple-100/20 to-transparent rounded-full blur-3xl translate-y-40 -translate-x-40 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-gradient-to-br from-blue-100/15 to-indigo-100/15 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <Header
        user={user}
        courses={courses}
        searchAllCourses={searchAllCourses}
        joinCourse={joinCourse}
        onSignOut={handleSignOut}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      <div className="flex relative">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onCollegeSelect={handleCollegeSelect}
          selectedCollege={selectedCollege}
        />

        <main className="flex-1 p-8 lg:p-12 relative">
          <div className="max-w-7xl mx-auto relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full blur-xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-tr from-purple-100/30 to-transparent rounded-full blur-lg pointer-events-none"></div>
            <div className="mb-10">
              <PageHeader
                title={selectedCollege ? `${selectedCollege} Courses` : "My Courses"}
                subtitle={selectedCollege ? `Discover courses available at ${selectedCollege}` : "Manage and access your enrolled courses"}
              />
            </div>

            {selectedCollege && (
              <div className="mb-8">
                <button
                  onClick={handleShowAllCourses}
                  className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 font-medium rounded-xl border border-gray-200/60 hover:bg-white hover:shadow-lg hover:shadow-gray-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer group"
                >
                  <svg className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to your Courses
                </button>
              </div>
            )}

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

      <AddCourseModal
        isOpen={isAddCourseModalOpen}
        onClose={() => setIsAddCourseModalOpen(false)}
        onSubmit={handleCreateCourse}
        loading={loading}
      />
    </div>
  );
}