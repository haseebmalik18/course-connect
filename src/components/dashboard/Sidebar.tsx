"use client";

import { useState } from "react";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  activeNav: string;
  onNavChange: (navId: string) => void;
  onCollegeSelect: (collegeName: string) => void;
  selectedCollege?: string;
}

const CUNY_COLLEGES = [
  "Baruch College",
  "Brooklyn College", 
  "City College",
  "Hunter College",
  "John Jay College",
  "Lehman College",
  "Queens College",
  "College of Staten Island",
  "York College",
  "NYC College of Technology",
  "Medgar Evers College",
  "Bronx Community College",
  "Borough of Manhattan Community College",
  "Guttman Community College",
  "Hostos Community College",
  "Kingsborough Community College",
  "LaGuardia Community College",
  "Queensborough Community College"
];

export default function Sidebar({ isMobileMenuOpen, activeNav, onNavChange, onCollegeSelect, selectedCollege }: SidebarProps) {
  const [isCollegesOpen, setIsCollegesOpen] = useState(false);

  const navItems = [
    { id: "courses", label: "My Courses", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ) },
    { id: "messages", label: "Messages", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ) },
    { id: "colleges", label: "Colleges", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ), hasDropdown: true }
  ];

  const handleCollegeClick = () => {
    if (activeNav === "colleges") {
      setIsCollegesOpen(!isCollegesOpen);
    } else {
      onNavChange("colleges");
      setIsCollegesOpen(true);
    }
  };

  const handleSpecificCollegeClick = (collegeName: string) => {
    onCollegeSelect(collegeName);
    setIsCollegesOpen(false);
  };

  return (
    <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 min-h-[calc(100vh-4rem)] fixed lg:sticky top-16 z-30 shadow-sm`}>
      <nav className="p-6 space-y-2">

        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => item.hasDropdown ? handleCollegeClick() : onNavChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                activeNav === item.id
                  ? "bg-blue-50/80 text-blue-600 font-medium shadow-sm border border-blue-100"
                  : "text-gray-700 hover:bg-gray-50/80 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.hasDropdown && (
                <svg className={`w-4 h-4 transition-transform duration-200 ${isCollegesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {item.hasDropdown && activeNav === "colleges" && isCollegesOpen && (
              <div className="ml-2 mt-2 space-y-1 border-l-2 border-gray-100 pl-4">
                {CUNY_COLLEGES.map((college) => (
                  <button
                    key={college}
                    onClick={() => handleSpecificCollegeClick(college)}
                    className={`w-full text-left px-3 py-2.5 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                      selectedCollege === college
                        ? "bg-blue-50/80 text-blue-700 font-medium shadow-sm border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-800 hover:shadow-sm"
                    }`}
                  >
                    {college}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}