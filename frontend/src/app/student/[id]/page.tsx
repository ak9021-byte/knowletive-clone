"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function StudentPerformancePage() {
  const { id } = useParams();
  const router = useRouter();
  const [scores, setScores] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const saved = localStorage.getItem("student");
    if (saved) setStudent(JSON.parse(saved));

    api.get(`/scores/student/${id}`)
      .then(r => setScores(r.data))
      .finally(() => setLoading(false));
  }, [id]);

  const totalAvg = scores.length
    ? Math.round(scores.reduce((a, s) => a + s.total_score, 0) / scores.length)
    : 0;

  const getLevel = (t: number) => {
    if (t >= 80) return { label: "Pro", emoji: "🏆", color: "#16a34a", bg: "#dcfce7" };
    if (t >= 50) return { label: "Learner", emoji: "📈", color: "#d97706", bg: "#fef3c7" };
    return { label: "Beginner", emoji: "🌱", color: "#dc2626", bg: "#fee2e2" };
  };

  const handleLogout = () => {
    localStorage.removeItem("student");
    router.push("/");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading performance...</p>
      </div>
    </div>
  );

  const level = getLevel(totalAvg);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-5">

        {/* ── HEADER BANNER ── */}
        <div className="rounded-2xl overflow-hidden shadow-xl"
          style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%)" }}>
          <div className="px-8 py-7 flex items-center justify-between gap-6">

            {/* Left — Avatar + Info */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black text-2xl shadow-lg"
                style={{ background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}>
                {student?.name?.charAt(0) || "S"}
              </div>
              <div className="min-w-0">
                <p className="text-purple-200 text-sm font-medium mb-0.5">Welcome back,</p>
                <h1 className="text-white text-2xl font-extrabold tracking-tight truncate">
                  {student?.name || "Student"}
                </h1>
                <p className="text-purple-300 text-sm mt-0.5 truncate">{student?.email}</p>
              </div>
            </div>

            {/* Right — Score + Logout */}
            <div className="flex items-center gap-5 flex-shrink-0">
              <div className="text-right">
                <p className="text-white text-4xl font-black leading-none">{totalAvg}</p>
                <p className="text-purple-300 text-xs mt-1">Avg Score / 100</p>
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-1.5"
                  style={{ color: level.color, background: level.bg }}>
                  {level.label} {level.emoji}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-colors"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1.5px solid rgba(255,255,255,0.35)",
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

          <div className="h-1 w-full" style={{
            background: "linear-gradient(90deg, #f59e0b, #a855f7, #3b82f6, #10b981)",
          }} />
        </div>

        {/* ── SCORE HISTORY ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-gray-50"
            style={{ background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)" }}>
            <div>
              <h2 className="text-white font-bold text-lg">Score History</h2>
              <p className="text-slate-400 text-xs mt-0.5">All recorded sessions</p>
            </div>
            <span className="bg-white bg-opacity-10 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg border border-white border-opacity-10">
              {scores.length} {scores.length === 1 ? "entry" : "entries"}
            </span>
          </div>

          {scores.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <p className="text-gray-500 font-semibold">No scores recorded yet</p>
              <p className="text-gray-400 text-sm mt-1">Your faculty hasn't submitted any scores for you</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {scores.map((s, i) => {
                const sLevel = getLevel(s.total_score);
                return (
                  <div key={i} className="px-6 py-5 hover:bg-slate-50 transition-colors duration-150">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                          style={{ background: "#eef2ff" }}>
                          📚
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 text-sm truncate">
                            {s.topic_name || "No topic"}
                          </p>
                          <p className="text-xs text-gray-400">{s.date}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-3xl font-black text-gray-800 leading-none">{s.total_score}</p>
                        <p className="text-xs text-gray-400 mt-0.5 mb-1">/ 100</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ color: sLevel.color, background: sLevel.bg }}>
                          {sLevel.label}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-3">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(100, s.total_score)}%`,
                          background: "linear-gradient(90deg, #4f46e5, #7c3aed, #a855f7)",
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {["personality","formals","cleanliness","attentive","communication"].map(k => (
                        <div key={k} className="text-center bg-gray-50 rounded-lg p-2.5">
                          <p className="text-sm font-black text-indigo-600">{s[k]}</p>
                          <p className="text-xs text-gray-400 capitalize truncate">{k}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}