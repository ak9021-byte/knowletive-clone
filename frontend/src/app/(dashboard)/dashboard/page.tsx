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
  if (score >= 80) return { label: "Pro",      color: "#16a34a", bg: "#dcfce7" };
  if (score >= 50) return { label: "Learner",  color: "#d97706", bg: "#fef3c7" };
  return               { label: "Beginner",  color: "#dc2626", bg: "#fee2e2" };
}

function getAttBadge(att: string) {
  if (att === "P")    return { label: "Present",  color: "#16a34a", bg: "#dcfce7" };
  if (att === "A")    return { label: "Absent",   color: "#dc2626", bg: "#fee2e2" };
  if (att === "Late") return { label: "Late",     color: "#d97706", bg: "#fef3c7" };
  if (att === "HD")   return { label: "Half Day", color: "#2563eb", bg: "#dbeafe" };
  return                     { label: att,        color: "#6b7280", bg: "#f3f4f6" };
}

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c2f", "#6366f1", "#6366f1"];

export default function DashboardPage() {
  // ✅ FIX: Don't read localStorage during render — use null initially
  const [faculty, setFaculty] = useState<{ name: string; id: number } | null>(null);
  const [tab, setTab]           = useState("Daily");
  const [stats, setStats]       = useState<DashboardStats>({
    total_students: 0, scored_today: 0,
    average_score: 0,  top_performers: [],
  });
  const [loading, setLoading]     = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateDisplay, setDateDisplay]   = useState("");

  // ✅ FIX: All client-only code inside useEffect
  useEffect(() => {
    const f = getFaculty();
    setFaculty(f);

    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);

    const display = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
    setDateDisplay(display);
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
  const progressPct  = stats.total_students > 0
    ? Math.min(100, (stats.scored_today / stats.total_students) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-5">

      {/* ── HEADER BANNER ── */}
      <div className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%)" }}>
        <div className="px-8 py-6 flex items-center justify-between gap-6">

          {/* Left — Welcome */}
          <div className="flex-1">
            <p className="text-purple-200 text-sm font-medium mb-1">Welcome back,</p>
            <h1 className="text-white text-3xl font-extrabold tracking-tight">
              {faculty?.name ?? ""}
            </h1>
            <p className="text-purple-300 text-sm mt-1">{dateDisplay}</p>
          </div>

          {/* Center — Logo */}
          <div className="flex flex-col items-center">
            <div style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              borderRadius: "20px",
              padding: "12px 28px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <img
                src="/logo.png"
                alt="Knowletive"
                style={{
                  height: "64px",
                  width: "auto",
                  objectFit: "contain",
                  display: "block",
                  margin: "0 auto",
                }}
              />
            </div>
          </div>

          {/* Right — Date + Logout */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "12px" }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: "12px",
                padding: "10px 16px",
                color: "#ffffff",
                fontSize: "0.875rem",
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
                gap: "8px",
                background: "rgba(255,255,255,0.15)",
                border: "1.5px solid rgba(255,255,255,0.35)",
                borderRadius: "12px",
                padding: "10px 20px",
                color: "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.3px",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Subtle bottom wave decoration */}
        <div className="h-1 w-full" style={{
          background: "linear-gradient(90deg, #f59e0b, #a855f7, #3b82f6, #10b981)",
        }} />
      </div>

      {/* ── TABS ── */}
      <div className="flex gap-2">
        {["Daily", "Weekly", "Monthly"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border
              ${tab === t
                ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-5">
        {[
          {
            label: "Total Students", value: stats.total_students, sub: "Registered in system",
            icon: (
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z"/>
              </svg>
            ),
            grad: "linear-gradient(135deg,#4f46e5,#7c3aed)",
            accent: "#4f46e5", lightBg: "#eef2ff",
          },
          {
            label: "Scored Today", value: stats.scored_today, sub: `of ${stats.total_students} students`,
            icon: (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ),
            grad: "linear-gradient(135deg,#059669,#10b981)",
            accent: "#059669", lightBg: "#ecfdf5",
          },
          {
            label: "Average Score", value: stats.average_score, sub: "out of 100 points",
            icon: (
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
            ),
            grad: "linear-gradient(135deg,#ea580c,#f97316)",
            accent: "#ea580c", lightBg: "#fff7ed",
          },
        ].map(({ label, value, sub, icon, grad, accent, lightBg }) => (
          <div key={label}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-200">
            {/* Background decoration */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-110"
              style={{ background: grad }} />

            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: grad }}>
                {icon}
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold px-2 py-1 rounded-lg"
                  style={{ color: accent, background: lightBg }}>
                  {tab}
                </div>
              </div>
            </div>

            <p className="text-4xl font-black text-gray-800 tracking-tight">
              {loading ? (
                <span className="inline-block w-12 h-10 bg-gray-100 rounded animate-pulse" />
              ) : value}
            </p>
            <p className="text-sm font-semibold text-gray-600 mt-1">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── PROGRESS BAR ── */}
      {stats.total_students > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-bold text-gray-800 text-base">Scoring Progress</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {pendingCount > 0
                  ? `${pendingCount} student${pendingCount > 1 ? "s" : ""} not yet scored`
                  : "All students scored for this date"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black text-indigo-600">{stats.scored_today}</span>
                <span className="text-gray-300 font-light"> / </span>
                <span className="text-lg font-bold text-gray-400">{stats.total_students}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center">
                <span className="text-sm font-black text-indigo-600">{Math.round(progressPct)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${progressPct}%`,
                background: "linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7)",
                boxShadow: "0 2px 8px rgba(79,70,229,0.4)",
              }}
            />
          </div>

          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">0%</span>
            <span className="text-xs text-gray-400">100%</span>
          </div>
        </div>
      )}

      {/* ── TOP PERFORMERS ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50"
          style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
          <div>
            <h2 className="text-white font-bold text-lg">Top Performers</h2>
            <p className="text-slate-400 text-xs mt-0.5">{selectedDate || "Today"}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-white bg-opacity-10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white border-opacity-10">
              Top {stats.top_performers.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading data...</p>
          </div>
        ) : stats.top_performers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">No scores recorded yet</p>
            <p className="text-gray-400 text-sm mt-1">Go to Score Entry to submit scores for today</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.top_performers.map((p, i) => {
              const level = getLevel(p.total_score);
              const att   = getAttBadge(p.attendance);
              return (
                <div key={p.student_id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors duration-150 group">

                  {/* Rank badge */}
                  <div className="w-10 flex-shrink-0 text-center">
                    {i < 3 ? (
                      <span className="text-2xl">{MEDALS[i]}</span>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mx-auto">
                        <span className="text-xs font-black text-indigo-400">#{i + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center text-white font-black text-lg shadow-sm"
                    style={{ background: `hsl(${(p.student_id * 47) % 360}, 60%, 55%)` }}>
                    {p.student_name.charAt(0)}
                  </div>

                  {/* Info + bar */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-gray-800 text-sm">{p.student_name}</p>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: att.color, background: att.bg }}>
                        {att.label}
                      </span>
                    </div>
                    {p.topic_name && (
                      <p className="text-xs text-gray-400 mb-1.5">Topic: {p.topic_name}</p>
                    )}
                    {/* Progress bar */}
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
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
                    <p className="text-3xl font-black text-gray-800 leading-none">{p.total_score}</p>
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
  );
}