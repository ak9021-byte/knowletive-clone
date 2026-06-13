"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, getFaculty } from "@/lib/auth";
import {
  LayoutDashboard, ClipboardList, Users, Trophy,
  Gift, BarChart2, CheckSquare, Zap, BookOpen, Target
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/score-entry", label: "Score Entry", icon: ClipboardList },
  { href: "/students", label: "Students", icon: Users },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/attendance", label: "Attendance", icon: CheckSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const faculty = getFaculty();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-indigo-700">Knowletive</h1>
        <p className="text-xs text-gray-400 mt-1">FACULTY PORTAL</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all
                ${active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Faculty info + logout */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg mb-3">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {faculty?.name?.charAt(0) || "F"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{faculty?.name || "Faculty"}</p>
            <p className="text-xs text-gray-400">Instructor</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-sm text-red-500 border border-red-200 rounded-lg py-2 hover:bg-red-50 transition"
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  );
}