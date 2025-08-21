"use client";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  activeNav: string;
  onNavChange: (navId: string) => void;
}

export default function Sidebar({ isMobileMenuOpen, activeNav, onNavChange }: SidebarProps) {
  const navItems = [
    { id: "courses", label: "My Courses", icon: "📚" },
    { id: "messages", label: "Messages", icon: "💬" },
    { id: "materials", label: "Materials", icon: "📁" },
    { id: "mentors", label: "Mentors", icon: "👥" },
    { id: "settings", label: "Settings", icon: "⚙️" }
  ];

  return (
    <aside className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] fixed lg:sticky top-16 z-30`}>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
              activeNav === item.id
                ? "bg-blue-50 text-blue-600 font-medium"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
} 