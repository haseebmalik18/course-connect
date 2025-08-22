"use client";

import { Class } from "@/lib/types/database";

interface CourseCardProps {
  course: Class;
  onClick: (courseId: string) => void;
}

export default function CourseCard({ course, onClick }: CourseCardProps) {
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
      onClick={() => onClick(course.class_id)}
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
          <span>{course.student_count || 0} members</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>{course.doc_count || 0} files</span>
        </div>
      </div>
    </div>
  );
} 