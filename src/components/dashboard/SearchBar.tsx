"use client";

import { useState, useEffect, useRef } from "react";
import { ClassWithStats } from "@/lib/types/database";

interface SearchBarProps {
  searchAllCourses: (query: string) => Promise<ClassWithStats[]>;
  joinCourse: (classId: string) => Promise<boolean>;
  userCourses: ClassWithStats[];
}

export default function SearchBar({ searchAllCourses, joinCourse, userCourses }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClassWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [joiningCourseId, setJoiningCourseId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const searchResults = await searchAllCourses(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
      } catch (error) {
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchAllCourses]);

  const handleJoinCourse = async (course: ClassWithStats) => {
    setJoiningCourseId(course.class_id);
    try {
      const success = await joinCourse(course.class_id);
      if (success) {
        setQuery("");
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
    } finally {
      setJoiningCourseId(null);
    }
  };

  const isUserAlreadyInCourse = (courseId: string) => {
    return userCourses.some(course => course.class_id === courseId);
  };

  const formatCollegeName = (collegeName: string) => {
    const collegeMap: { [key: string]: string } = {
      "Baruch College": "baruch",
      "Brooklyn College": "brooklyn", 
      "City College": "ccny",
      "Hunter College": "hunter",
      "John Jay College": "jjay",
      "Lehman College": "lehman",
      "Queens College": "qc",
      "College of Staten Island": "csi",
      "York College": "york",
      "NYC College of Technology": "citytech",
      "Medgar Evers College": "medgar",
      "Bronx Community College": "bcc",
      "Borough of Manhattan Community College": "bmcc",
      "Guttman Community College": "guttman",
      "Hostos Community College": "hostos",
      "Kingsborough Community College": "kbcc",
      "LaGuardia Community College": "lagcc",
      "Queensborough Community College": "qcc"
    };
    return collegeMap[collegeName] || collegeName.toLowerCase();
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl mx-4 lg:mx-8">
      <div className="relative">
        <input
          type="text"
          placeholder="Search all courses..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {isLoading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && !isLoading && (
            <div className="p-4 text-center text-gray-500">
              No courses found for &quot;{query}&quot;
            </div>
          )}
          
          {results.map((course) => {
            const isAlreadyJoined = isUserAlreadyInCourse(course.class_id);
            const isJoining = joiningCourseId === course.class_id;
            
            return (
              <div
                key={course.class_id}
                className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {course.class_subject} {course.class_number} - {formatCollegeName(course.college_name)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {course.college_name}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        {course.member_count || 0} members
                      </span>
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        {course.document_count || 0} files
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    {isAlreadyJoined ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Joined
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinCourse(course)}
                        disabled={isJoining}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isJoining ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-800 mr-1"></div>
                            Joining...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Join Course
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}