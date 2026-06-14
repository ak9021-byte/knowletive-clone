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
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const f = localStorage.getItem("faculty");
    if (f) setFaculty(JSON.parse(f));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (isMobile && open) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobile, open]);

  const initials = faculty?.name
    ? faculty.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "FA";

  const sidebarInner = (
    <aside style={{
      width: 240, minWidth: 240, minHeight: "100vh",
      background: "#fff", borderRight: "1px solid #e5e7eb",
      display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg,#6366f1,#9333ea)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, boxShadow: "0 4px 12px rgba(99,102,241,0.3)",
          }}>
            <span style={{ fontSize: 28 }}>📚</span>
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: 0, lineHeight: 1 }}>
              Knowletive
            </h1>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "4px 0 0", lineHeight: 1.3 }}>
              Training Minds, Placing Talents
            </p>
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Faculty Portal
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "20px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 12 }}>
          Navigation
        </p>
        {navItems.map(({ href, label, emoji }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: 12, marginBottom: 4,
              textDecoration: "none", transition: "all 0.15s",
              background: active ? "#eef2ff" : "transparent",
              color: active ? "#4338ca" : "#4b5563",
              fontWeight: active ? 600 : 500,
            }}>
              <span style={{ fontSize: 18, width: 24, textAlign: "center", lineHeight: 1 }}>{emoji}</span>
              <span style={{ fontSize: 15 }}>{label}</span>
              {active && (
                <span style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#6366f1" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px", borderTop: "1px solid #f3f4f6", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px", background: "#eef2ff", border: "1px solid #e0e7ff", borderRadius: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#4f46e5", display: "flex", alignItems: "center",
            justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1f2937", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {faculty?.name ?? "Faculty"}
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>Instructor</p>
          </div>
        </div>
        <button onClick={logout} style={{
          width: "100%", fontSize: 14, fontWeight: 500, color: "#ef4444",
          border: "1px solid #fecaca", background: "#fff1f2", borderRadius: 12,
          padding: "10px", cursor: "pointer",
        }}>
          🚪 Sign out
        </button>
      </div>
    </aside>
  );

  if (!isMobile) return sidebarInner;

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", top: 12, left: 12, zIndex: 100,
          width: 44, height: 44, background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label="Open menu"
      >
        <svg width="22" height="22" fill="none" stroke="#374151" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)",
        }} />
      )}

      {/* Drawer */}
      <div style={{
        position: "fixed", top: 0, left: 0, zIndex: 300, height: "100%",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }}>
        <button
          onClick={() => setOpen(false)}
          style={{
            position: "absolute", top: 12, right: -52, zIndex: 10,
            width: 44, height: 44, background: "#fff",
            border: "1px solid #e5e7eb", borderRadius: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Close menu"
        >
          <svg width="18" height="18" fill="none" stroke="#374151" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {sidebarInner}
      </div>
    </>
  );
}