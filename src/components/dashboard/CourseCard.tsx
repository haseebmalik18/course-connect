"use client";

import { ClassWithStats } from "@/lib/types/database";

interface CourseCardProps {
  course: ClassWithStats;
  onClick: (courseId: string) => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
  const colors = [
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-pink-600", 
    "from-green-500 to-emerald-600",
    "from-orange-500 to-red-500",
    "from-teal-500 to-cyan-600",
    "from-violet-500 to-purple-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600"
  ];
  
  const colorIndex = Math.abs(course.class_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  const color = colors[colorIndex] || colors[0];

  return (
    <div
      onClick={() => onClick(course.class_id)}
      className="group bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:shadow-gray-400/20 hover:-translate-y-3 hover:border-white/80 hover:bg-white/90 transition-all duration-500 cursor-pointer"
    >
      {/* Top accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${color} rounded-full mb-4 shadow-sm`}></div>
      
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200/50 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-blue-300/60 group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-md">
          <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
        {course.class_subject} {course.class_number}
      </h3>
      <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 mb-4">
        {course.college_name}
      </p>
      
      <div className="flex justify-between text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
        <span>{course.member_count || 0} members</span>
        <span>{course.document_count || 0} files</span>
      </div>
    </div>
  );
} 