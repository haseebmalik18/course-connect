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
      <div className="col-span-full text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full text-center py-12">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">Error loading courses</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
        <p className="text-gray-600 mb-6">Get started by creating your first course.</p>
        
        {/* Create Course Button */}
        <button
          onClick={onAddCourse}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Your First Course
        </button>
      </div>
    );
  }

  return (
    <>
      {courses.map((course) => (
        <CourseCard
          key={course.class_id}
          course={course}
          onClick={onCourseClick}
        />
      ))}
      
      {/* Add New Course Card */}
      <div
        onClick={onAddCourse}
        className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1 flex flex-col items-center justify-center min-h-[200px]"
      >
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors mb-3">
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <span className="text-gray-600 font-medium group-hover:text-blue-600">Add New Course</span>
      </div>
    </>
  );
} 