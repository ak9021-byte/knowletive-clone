"use client";
// frontend/src/app/(dashboard)/analytics/page.tsx

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";

// ── Types ────────────────────────────────────────────────────────────────────
interface CategoryStat {
  avg: number;
  max: number;
  pct: number;
}

interface StudentAnalytics {
  student_id: number;
  student_name: string;
  student_email: string;
  photo_url?: string;
  avg_score: number;
  sessions: number;
  streak: number;
  level: "Pro" | "Learner" | "Beginner";
  categories: Record<string, CategoryStat>;
}

interface AnalyticsData {
  total_students: number;
  active_students: number;
  class_avg: number;
  days: number;
  students: StudentAnalytics[];
}

// ── Constants ────────────────────────────────────────────────────────────────
const DAY_OPTIONS = [4, 7, 14, 30];

const CATEGORY_META: Record<string, { emoji: string; color: string; bar: string }> = {
  "Personality":         { emoji: "🌟", color: "text-purple-600", bar: "bg-purple-500" },
  "Formals":             { emoji: "👔", color: "text-blue-600",   bar: "bg-blue-500"   },
  "Cleanliness":         { emoji: "🧹", color: "text-green-600",  bar: "bg-green-500"  },
  "Socks":               { emoji: "🧦", color: "text-orange-500", bar: "bg-orange-400" },
  "Shoes":               { emoji: "👟", color: "text-red-500",    bar: "bg-red-500"    },
  "Attentive":           { emoji: "👁️", color: "text-indigo-600", bar: "bg-indigo-500" },
  "Interactive":         { emoji: "🤝", color: "text-teal-600",   bar: "bg-teal-500"   },
  "Communication":       { emoji: "💬", color: "text-pink-500",   bar: "bg-pink-500"   },
  "Confidence":          { emoji: "💪", color: "text-yellow-600", bar: "bg-yellow-400" },
  "Technical Knowledge": { emoji: "💻", color: "text-blue-800",   bar: "bg-blue-700"   },
};

const LEVEL_STYLE = {
  Pro:      "bg-green-100 text-green-700",
  Learner:  "bg-yellow-100 text-yellow-700",
  Beginner: "bg-red-100 text-red-700",
};

const LEVEL_EMOJI = { Pro: "🏆", Learner: "🌟", Beginner: "🌱" };

// ── Component ────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const faculty = getFaculty();
  const [days, setDays]           = useState(7);
  const [custom, setCustom]       = useState("");
  const [data, setData]           = useState<AnalyticsData | null>(null);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<number | null>(null);
  const [search, setSearch]       = useState("");

  const load = (d: number) => {
    if (!faculty) return;
    setLoading(true);
    api.get(`/scores/analytics?faculty_id=${faculty.id}&days=${d}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(days); }, [days]);

  const applyCustom = () => {
    const n = parseInt(custom);
    if (n > 0 && n <= 365) { setDays(n); setCustom(""); }
  };

  const filtered = data?.students.filter(s =>
    s.student_name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const avgColor = (avg: number) =>
    avg >= 80 ? "text-green-600" : avg >= 50 ? "text-orange-500" : "text-red-500";

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📊 Performance Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Average scores and category breakdown per student</p>
      </div>

      {/* Time Filter */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-4 mb-5 flex items-center gap-3 flex-wrap">
        <span className="text-sm text-gray-500 font-medium">Show averages for last:</span>
        <div className="flex gap-2">
          {DAY_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition border
                ${days === d
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-500 border-gray-200 hover:border-indigo-300"}`}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <input
            type="number"
            min={1} max={365}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            placeholder="Custom"
            className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={applyCustom}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold border border-indigo-300 text-indigo-600 hover:bg-indigo-50 transition"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border-t-4 border-indigo-500 shadow-sm">
          <div className="text-3xl mb-2">👥</div>
          <p className="text-4xl font-bold text-indigo-600">{data?.total_students ?? "—"}</p>
          <p className="text-sm text-gray-400 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-t-4 border-green-500 shadow-sm">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-4xl font-bold text-green-600">{data?.active_students ?? "—"}</p>
          <p className="text-sm text-gray-400 mt-1">Active Students</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-t-4 border-orange-400 shadow-sm">
          <div className="text-3xl mb-2">📈</div>
          <p className="text-4xl font-bold text-orange-500">{data?.class_avg ?? "—"}</p>
          <p className="text-sm text-gray-400 mt-1">Class Avg ({days}d)</p>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="🔍 Search student..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-200 shadow-sm"
      />

      {/* Loading */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2 animate-pulse">📊</p>
          <p>Loading analytics...</p>
        </div>
      )}

      {/* No data */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">
          <p className="text-4xl mb-2">📭</p>
          <p>No score data found for the last {days} days.</p>
          <p className="text-sm mt-1">Submit scores from Score Entry to see analytics here.</p>
        </div>
      )}

      {/* Student Cards */}
      {!loading && (
        <div className="space-y-3">
          {filtered.map(s => {
            const isOpen = expanded === s.student_id;
            return (
              <div key={s.student_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">

                {/* Student Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : s.student_id)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    {s.photo_url ? (
                      <img src={s.photo_url} className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: `hsl(${(s.student_id * 47) % 360}, 60%, 55%)` }}>
                        {s.student_name.charAt(0)}
                      </div>
                    )}

                    {/* Info */}
                    <div>
                      <p className="font-semibold text-gray-800 text-base">{s.student_name}</p>
                      <p className="text-xs text-gray-400">{s.student_email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_STYLE[s.level]}`}>
                          {LEVEL_EMOJI[s.level]} {s.level}
                        </span>
                        <span className="text-xs text-gray-400">
                          📅 {s.sessions} session{s.sessions !== 1 ? "s" : ""} in {days}d
                        </span>
                        <span className="text-xs text-gray-400">
                          {s.streak > 0 ? `🔥 ${s.streak}-day streak` : "No streak yet"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score + chevron */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${avgColor(s.avg_score)}`}>
                        {s.avg_score}
                      </p>
                      <p className="text-xs text-gray-400">avg / 100</p>
                      {/* Mini bar */}
                      <div className="w-24 bg-gray-100 rounded-full h-1 mt-1">
                        <div
                          className={`h-1 rounded-full ${
                            s.avg_score >= 80 ? "bg-green-500" :
                            s.avg_score >= 50 ? "bg-orange-400" : "bg-red-500"
                          }`}
                          style={{ width: `${s.avg_score}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>

                {/* Category Breakdown — expanded */}
                {isOpen && (
                  <div className="px-5 pb-5 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-4">
                      Category Breakdown — {days} Day Average
                    </p>
                    <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                      {Object.entries(s.categories).map(([cat, stat]) => {
                        const meta = CATEGORY_META[cat] ?? { emoji: "📌", color: "text-gray-600", bar: "bg-gray-400" };
                        return (
                          <div key={cat}>
                            {/* Label row */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-semibold text-gray-700">
                                {meta.emoji} {cat}
                              </span>
                              <span className={`text-sm font-bold ${meta.color}`}>
                                {stat.avg}
                                <span className="text-gray-300 font-normal text-xs">/{stat.max}</span>
                              </span>
                            </div>
                            {/* Thick progress bar */}
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${meta.bar}`}
                                style={{ width: `${stat.pct}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{stat.pct}% of max</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}