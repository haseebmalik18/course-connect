"use client";

import CourseCard from "./CourseCard";
import { ClassWithStats } from "@/lib/types/database";

interface CourseGridProps {
  courses: ClassWithStats[];
  loading: boolean;
  error: string | null;
  onCourseClick: (courseId: string) => void;
  onAddCourse: () => void;
}

export default function CourseGrid({ courses, loading, error, onCourseClick, onAddCourse }: CourseGridProps) {
  if (loading) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-t-purple-400 mx-auto animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="text-gray-600 mt-6 text-lg font-medium">Loading your courses...</p>
        <p className="text-gray-500 text-sm mt-2">This won't take long</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-16">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h3>
        <p className="text-red-600 font-medium mb-1">Error loading courses</p>
        <p className="text-gray-600 text-sm max-w-md mx-auto">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full text-center py-20">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="absolute inset-0 w-24 h-24 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full mx-auto animate-pulse"></div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses yet</h3>
        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">Ready to start your learning journey? Create your first course and connect with fellow students.</p>
        
        <button
          onClick={onAddCourse}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full text-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-blue-200/50 hover:shadow-2xl hover:shadow-blue-300/60 group"
        >
          <svg className="w-6 h-6 mr-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Course
        </button>
      </div>
    );
  }

  return (
    <>
      {courses.map((course, index) => (
        <div 
          key={course.class_id}
          className="animate-in fade-in slide-in-from-bottom duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CourseCard
            course={course}
            onClick={onCourseClick}
          />
        </div>
      ))}
      
      {/* Add New Course Card */}
      <div
        onClick={onAddCourse}
        className="group bg-white/60 backdrop-blur-sm p-8 rounded-2xl shadow-lg border-2 border-dashed border-gray-300/60 hover:shadow-2xl hover:shadow-blue-400/20 hover:-translate-y-3 hover:border-blue-400/80 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/30 transition-all duration-500 cursor-pointer flex flex-col items-center justify-center min-h-[200px]"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl flex items-center justify-center mb-6 group-hover:from-blue-200 group-hover:to-blue-300/60 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
          <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
          Add New Course
        </h3>
        <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 text-center">
          Create a course to get started
        </p>
      </div>
    </>
  );
} 