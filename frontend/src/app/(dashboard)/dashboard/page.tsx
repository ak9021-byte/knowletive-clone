"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getFaculty, logout } from "@/lib/auth";

interface TopPerformer {
  student_id: number;
  student_name: string;
  total_score: number;
  attendance: string;
  topic_name: string;
}

interface DashboardStats {
  total_students: number;
  scored_today: number;
  average_score: number;
  top_performers: TopPerformer[];
}

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

function getLevel(score: number) {
  if (score >= 80) return { label: "Pro",     color: "#16a34a", bg: "#dcfce7" };
  if (score >= 50) return { label: "Learner", color: "#d97706", bg: "#fef3c7" };
  return               { label: "Beginner", color: "#dc2626", bg: "#fee2e2" };
}

function getAttBadge(att: string) {
  if (att === "P")    return { label: "Present",  color: "#16a34a", bg: "#dcfce7" };
  if (att === "A")    return { label: "Absent",   color: "#dc2626", bg: "#fee2e2" };
  if (att === "Late") return { label: "Late",     color: "#d97706", bg: "#fef3c7" };
  if (att === "HD")   return { label: "Half Day", color: "#2563eb", bg: "#dbeafe" };
  return                     { label: att,        color: "#6b7280", bg: "#f3f4f6" };
}

export default function DashboardPage() {
  const [faculty, setFaculty] = useState<{ name: string; id: number } | null>(null);
  const [tab, setTab] = useState("Daily");
  const [stats, setStats] = useState<DashboardStats>({
    total_students: 0, scored_today: 0,
    average_score: 0, top_performers: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateDisplay, setDateDisplay] = useState("");

  useEffect(() => {
    const f = getFaculty();
    setFaculty(f);
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
    setDateDisplay(new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    }));
  }, []);

  const loadStats = async () => {
    if (!faculty || !selectedDate) return;
    setLoading(true);
    try {
      const res = await api.get("/scores/stats/daily", {
        params: { faculty_id: faculty.id, date: selectedDate },
      });
      setStats(res.data);
    } catch {
      console.error("Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (faculty && selectedDate) loadStats();
  }, [selectedDate, faculty]);

  const pendingCount = stats.total_students - stats.scored_today;
  const progressPct = stats.total_students > 0
    ? Math.min(100, (stats.scored_today / stats.total_students) * 100) : 0;

  return (
    <>
      {/* ── Responsive styles ── */}
      <style>{`
        .dash-header {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 16px;
          padding: 20px 28px;
        }
        .dash-logo { display: flex; flex-direction: column; align-items: center; }
        .dash-right { display: flex; align-items: center; justify-content: flex-end; gap: 10px; }
        .dash-date-input { display: block; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .performer-row { display: flex; align-items: center; gap: 16px; padding: 16px 24px; }
        .performer-score { font-size: 2rem; }

        @media (max-width: 768px) {
          .dash-header {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto auto;
            text-align: center;
            padding: 16px;
            gap: 12px;
          }
          .dash-welcome { order: 2; }
          .dash-logo { order: 1; }
          .dash-right {
            order: 3;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
          }
          .dash-date-input { width: 100%; }
          .stat-grid { grid-template-columns: 1fr; gap: 12px; }
          .performer-row { padding: 12px 16px; gap: 10px; }
          .performer-score { font-size: 1.5rem; }
          .performer-avatar { width: 36px !important; height: 36px !important; font-size: 0.9rem !important; }
          .performer-rank { width: 32px !important; }
        }

        @media (min-width: 480px) and (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-3 md:p-6 space-y-4 md:space-y-5">

        {/* ── HEADER BANNER ── */}
        <div className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%)" }}>
          <div className="dash-header">

            {/* Welcome */}
            <div className="dash-welcome">
              <p className="text-purple-200 text-sm font-medium mb-1">👋 Welcome back,</p>
              <h1 className="text-white text-xl md:text-3xl font-extrabold tracking-tight">
                {faculty?.name ?? ""}
              </h1>
              <p className="text-purple-300 text-xs md:text-sm mt-1 hidden md:block">{dateDisplay}</p>
            </div>

            {/* Logo */}
            <div className="dash-logo">
              <div style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "16px",
                padding: "10px 20px",
                textAlign: "center",
                backdropFilter: "blur(10px)",
              }}>
                <img
                  src="/logo.png"
                  alt="Knowletive"
                  style={{
                    height: "48px",
                    width: "auto",
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
              </div>
            </div>

            {/* Date + Logout */}
            <div className="dash-right">
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="dash-date-input"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  padding: "8px 12px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  outline: "none",
                }}
              />
              <button
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  color: "#ffffff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Rainbow bar */}
          <div className="h-1 w-full" style={{
            background: "linear-gradient(90deg, #f59e0b, #a855f7, #3b82f6, #10b981)",
          }} />
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["Daily", "Weekly", "Monthly"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 md:px-6 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border
                ${tab === t
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── STAT CARDS ── */}
        <div className="stat-grid">
          {[
            {
              label: "Total Students", value: stats.total_students,
              sub: "Registered in system",
              icon: "👥",
              grad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
              accent: "#4f46e5", lightBg: "#eef2ff",
            },
            {
              label: "Scored Today", value: stats.scored_today,
              sub: `of ${stats.total_students} students`,
              icon: "✅",
              grad: "linear-gradient(135deg,#059669,#10b981)",
              accent: "#059669", lightBg: "#ecfdf5",
            },
            {
              label: "Average Score", value: stats.average_score,
              sub: "out of 100 points",
              icon: "📊",
              grad: "linear-gradient(135deg,#ea580c,#f97316)",
              accent: "#ea580c", lightBg: "#fff7ed",
            },
          ].map(({ label, value, sub, icon, grad, accent, lightBg }) => (
            <div key={label}
              className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
                style={{ background: grad }} />

              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl shadow-lg"
                  style={{ background: grad }}>
                  {icon}
                </div>
                <div className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: accent, background: lightBg }}>
                  {tab}
                </div>
              </div>

              <p className="text-3xl md:text-4xl font-black text-gray-800 tracking-tight">
                {loading ? (
                  <span className="inline-block w-10 h-8 bg-gray-100 rounded animate-pulse" />
                ) : value}
              </p>
              <p className="text-sm font-semibold text-gray-600 mt-1">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── PROGRESS BAR ── */}
        {stats.total_students > 0 && (
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div>
                <p className="font-bold text-gray-800 text-sm md:text-base">📈 Scoring Progress</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {pendingCount > 0
                    ? `${pendingCount} student${pendingCount > 1 ? "s" : ""} not yet scored`
                    : "🎉 All students scored!"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-black text-indigo-600">{stats.scored_today}</span>
                <span className="text-gray-300">/</span>
                <span className="text-lg font-bold text-gray-400">{stats.total_students}</span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center ml-1">
                  <span className="text-xs font-black text-indigo-600">{Math.round(progressPct)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#4f46e5,#7c3aed,#a855f7)",
                  boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-400">0%</span>
              <span className="text-xs text-gray-400">100%</span>
            </div>
          </div>
        )}

        {/* ── TOP PERFORMERS ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 md:px-6 py-4 md:py-5 flex items-center justify-between border-b border-gray-50"
            style={{ background: "linear-gradient(135deg,#1e293b 0%,#334155 100%)" }}>
            <div>
              <h2 className="text-white font-bold text-base md:text-lg">🏆 Top Performers</h2>
              <p className="text-slate-400 text-xs mt-0.5">{selectedDate || "Today"}</p>
            </div>
            <span className="bg-white bg-opacity-10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white border-opacity-10">
              Top {stats.top_performers.length}
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          ) : stats.top_performers.length === 0 ? (
            <div className="py-12 text-center px-4">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500 font-semibold text-sm">No scores recorded yet</p>
              <p className="text-gray-400 text-xs mt-1">Go to Score Entry to submit scores</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.top_performers.map((p, i) => {
                const level = getLevel(p.total_score);
                const att = getAttBadge(p.attendance);
                return (
                  <div key={p.student_id} className="performer-row hover:bg-slate-50 transition-colors">

                    {/* Rank */}
                    <div className="performer-rank w-8 flex-shrink-0 text-center">
                      {i < 3 ? (
                        <span className="text-xl md:text-2xl">{MEDALS[i]}</span>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center mx-auto">
                          <span className="text-xs font-black text-indigo-400">#{i + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="performer-avatar flex-shrink-0 flex items-center justify-center text-white font-black shadow-sm rounded-xl"
                      style={{
                        width: "44px", height: "44px", fontSize: "1.1rem",
                        background: `hsl(${(p.student_id * 47) % 360},60%,55%)`,
                      }}>
                      {p.student_name.charAt(0)}
                    </div>

                    {/* Info + bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-bold text-gray-800 text-sm truncate">{p.student_name}</p>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ color: att.color, background: att.bg }}>
                          {att.label}
                        </span>
                      </div>
                      {p.topic_name && (
                        <p className="text-xs text-gray-400 mb-1.5 truncate">📖 {p.topic_name}</p>
                      )}
                      <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, p.total_score)}%`,
                            background: i === 0
                              ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                              : i === 1
                              ? "linear-gradient(90deg,#94a3b8,#cbd5e1)"
                              : i === 2
                              ? "linear-gradient(90deg,#cd7c2f,#d97706)"
                              : "linear-gradient(90deg,#6366f1,#818cf8)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right flex-shrink-0">
                      <p className="performer-score font-black text-gray-800 leading-none">{p.total_score}</p>
                      <p className="text-xs text-gray-400 mt-0.5 mb-1">/ 100</p>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ color: level.color, background: level.bg }}>
                        {level.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </>
  );
}