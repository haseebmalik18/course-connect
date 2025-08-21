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
import LoadingSpinner from "./LoadingSpinner";
import { Class } from "@/lib/types/database";

export default function Dashboard() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("courses");
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { courses, loading, error, createCourse, searchAllCourses, joinCourse } = useCourses(user?.id);

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
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <PageHeader
              title="My Courses"
              subtitle="Manage and access your enrolled courses"
            />

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <CourseGrid
                courses={courses}
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