"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";
import { useState, useEffect } from "react";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",  emoji: "🏠" },
  { href: "/score-entry", label: "Score Entry", emoji: "📝" },
  { href: "/students",    label: "Students",    emoji: "👥" },
  { href: "/leaderboard", label: "Leaderboard", emoji: "🏆" },
  { href: "/analytics",   label: "Analytics",   emoji: "📊" },
  { href: "/attendance",  label: "Attendance",  emoji: "✅" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [faculty, setFaculty] = useState<{ name: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = localStorage.getItem("faculty");
    if (f) setFaculty(JSON.parse(f));
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initials = faculty?.name
    ? faculty.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "FA";

  const sidebarContent = (
    <aside className="w-[240px] min-w-[240px] min-h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-3xl">📚</span>
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-gray-900 leading-none mb-1">
              Knowletive
            </h1>
            <p className="text-[11px] text-gray-400 leading-tight">
              Training Minds, Placing Talents
            </p>
          </div>
        </div>
        <span className="inline-block text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">
          Faculty Portal
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-4 py-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-3">
          Navigation
        </p>
        {navItems.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl mb-1 transition-all
                ${active
                  ? "bg-indigo-50 text-indigo-700 font-semibold"
                  : "text-gray-600 font-medium hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <span className="text-lg w-6 text-center leading-none">{emoji}</span>
              <span className="text-[15px]">{label}</span>
              {active && (
                <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="px-4 pb-5 pt-4 border-t border-gray-100 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-3 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-gray-800 truncate">
              {faculty?.name ?? "Faculty"}
            </p>
            <p className="text-xs text-gray-400">Instructor</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-[14px] font-medium text-red-500 border border-red-200 bg-red-50 rounded-xl py-2.5 hover:bg-red-100 transition"
        >
          🚪 Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* ── Desktop: always visible ── */}
      <div className="hidden lg:flex">
        {sidebarContent}
      </div>

      {/* ── Mobile: hamburger button ── */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center"
        aria-label="Open menu"
      >
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Mobile: backdrop ── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <div
        className={`lg:hidden fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Close button inside drawer */}
        <div className="relative">
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-[-48px] w-10 h-10 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center z-10"
            aria-label="Close menu"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}