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

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const initials = faculty?.name
    ? faculty.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "FA";

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[100] w-11 h-11 bg-white border border-gray-200 rounded-xl shadow-md flex items-center justify-center"
        aria-label="Open menu"
      >
        <svg width="22" height="22" fill="none" stroke="#374151" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop (mobile only, when open) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="lg:hidden fixed inset-0 z-[200] bg-black/45 backdrop-blur-sm"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-[300] h-screen w-60 min-w-60
          bg-white border-r border-gray-200 flex flex-col flex-shrink-0
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        {/* Close button (mobile only) */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-3 right-3 w-9 h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center"
          aria-label="Close menu"
        >
          <svg width="16" height="16" fill="none" stroke="#374151" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg,#6366f1,#9333ea)" }}>
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 leading-none">Knowletive</h1>
              <p className="text-xs text-gray-400 mt-1 leading-tight">Training Minds, Placing Talents</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">
            Faculty Portal
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 overflow-y-auto">
          <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-2 mb-3">
            Navigation
          </p>
          {navItems.map(({ href, label, emoji }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 no-underline transition-colors
                  ${active ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-600 font-medium hover:bg-gray-50"}`}
              >
                <span className="text-lg w-6 text-center leading-none">{emoji}</span>
                <span className="text-sm">{label}</span>
                {active && <span className="ml-auto w-2 h-2 rounded-full bg-indigo-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {faculty?.name ?? "Faculty"}
              </p>
              <p className="text-xs text-gray-400">Instructor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-sm font-medium text-red-500 border border-red-200 bg-red-50 rounded-xl py-2.5 cursor-pointer"
          >
            🚪 Sign out
          </button>
        </div>
      </aside>
    </>
  );
}