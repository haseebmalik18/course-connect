"use client";

import { useState } from "react";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  activeNav: string;
  onNavChange: (navId: string) => void;
}

const CUNY_COLLEGES = [
  "Baruch College",
  "Brooklyn College", 
  "City College",
  "Hunter College",
  "John Jay College",
  "Lehman College",
  "Medgar Evers College",
  "New York City College of Technology",
  "Queens College",
  "Staten Island College",
  "York College",
  "Graduate School and University Center"
];

export default function Sidebar({ isMobileMenuOpen, activeNav, onNavChange }: SidebarProps) {
  const [isCollegesOpen, setIsCollegesOpen] = useState(false);

  const navItems = [
    { id: "courses", label: "My Courses", icon: "📚" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "colleges", label: "Colleges", icon: "🏛️", hasDropdown: true }
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
    console.log(`Clicked on ${collegeName}`);
    // TODO: Implement college-specific course viewing
  };

  return (
    <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] fixed lg:sticky top-16 z-30`}>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => item.hasDropdown ? handleCollegeClick() : onNavChange(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                activeNav === item.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.hasDropdown && (
                <span className={`text-sm transition-transform ${isCollegesOpen ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              )}
            </button>

            {item.hasDropdown && activeNav === "colleges" && isCollegesOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {CUNY_COLLEGES.map((college) => (
                  <button
                    key={college}
                    onClick={() => handleSpecificCollegeClick(college)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 rounded transition-colors"
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