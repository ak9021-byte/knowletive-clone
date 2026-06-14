"use client";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Status = "P" | "HD" | "A" | "H" | "";

interface StudentRow {
  id: number;
  name: string;
  photo_url?: string;
  status: Status;
}

interface SummaryStudent {
  student_id: number;
  student_name: string;
  photo_url?: string;
  P: number; HD: number; A: number; H: number;
  total_days: number;
  percentage: number;
  records: { date: string; status: string }[];
}

interface Summary {
  total_students: number;
  days_marked: number;
  avg_attendance: number;
  students: SummaryStudent[];
}

const STATUS_CONFIG = {
  P:  { label: "P",  full: "Present",  bg: "bg-green-500",  text: "text-green-700",  border: "border-green-400",  light: "bg-green-50"  },
  HD: { label: "HD", full: "Half Day", bg: "bg-blue-500",   text: "text-blue-700",   border: "border-blue-400",   light: "bg-blue-50"   },
  A:  { label: "A",  full: "Absent",   bg: "bg-red-500",    text: "text-red-700",    border: "border-red-400",    light: "bg-red-50"    },
  H:  { label: "H",  full: "Holiday",  bg: "bg-yellow-400", text: "text-yellow-700", border: "border-yellow-400", light: "bg-yellow-50" },
};

const pctColor = (p: number) =>
  p >= 90 ? "text-green-600" : p >= 75 ? "text-orange-500" : "text-red-500";

// ── Reusable Avatar ──────────────────────────────────────────
function Avatar({
  name,
  photo_url,
  size = 40,
  id = 0,
}: {
  name: string;
  photo_url?: string;
  size?: number;
  id?: number;
}) {
  const src = photo_url
    ? photo_url.startsWith("http")
      ? photo_url
      : `${API_BASE}${photo_url}`
    : null;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 border-2 border-indigo-100"
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        background: `hsl(${(id * 47) % 360}, 60%, 55%)`,
        fontSize: size * 0.38,
      }}
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AttendancePage() {
  const faculty = getFaculty();
  const [view, setView]         = useState<"mark" | "summary">("mark");
  const [date, setDate]         = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [search, setSearch]     = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(true);

  // Load students once
  useEffect(() => {
    if (!faculty) return;
    api.get(`/students/?faculty_id=${faculty.id}`).then(r => {
      setStudents(r.data.map((s: any) => ({ ...s, status: "" as Status })));
      setLoading(false);
    });
  }, []);

  // Load existing attendance when date changes
  useEffect(() => {
    if (!faculty || view !== "mark") return;
    api
      .get(`/attendance/date/${date}?faculty_id=${faculty.id}`)
      .then(r => {
        const map: Record<number, Status> = {};
        r.data.forEach((a: any) => { map[a.student_id] = a.status; });
        setStudents(prev => prev.map(s => ({ ...s, status: map[s.id] ?? "" })));
      })
      .catch(() => {});
  }, [date, view]);

  // Load summary
  const loadSummary = useCallback(() => {
    if (!faculty) return;
    api
      .get(`/attendance/summary?faculty_id=${faculty.id}`)
      .then(r => setSummary(r.data));
  }, [faculty]);

  useEffect(() => {
    if (view === "summary") loadSummary();
  }, [view]);

  const setStatus = (id: number, status: Status) =>
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));

  const markAll = (status: Status) =>
    setStudents(prev => prev.map(s => ({ ...s, status })));

  const handleSave = async () => {
    if (!faculty) return;
    setSaving(true);
    try {
      await api.post(`/attendance/?faculty_id=${faculty.id}`, {
        date,
        entries: students.filter(s => s.status).map(s => ({
          student_id: s.id,
          status: s.status,
        })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Error saving attendance");
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const markedCount = students.filter(s => s.status).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">✅ Attendance Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            90-day course · Data synced across all devices
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("mark")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition
              ${view === "mark"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            🖊️ Mark
          </button>
          <button
            onClick={() => setView("summary")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition
              ${view === "summary"
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
          >
            📊 Summary
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 mb-5 text-xs text-gray-500">
        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`w-5 h-5 rounded text-white flex items-center justify-center font-bold text-xs ${v.bg}`}>
              {v.label}
            </span>
            {v.full}{k === "P" ? " (1.0)" : k === "HD" ? " (0.5)" : k === "A" ? " (0.0)" : ""}
          </span>
        ))}
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border-t-4 border-indigo-500 shadow-sm">
          <div className="text-2xl mb-1">👥</div>
          <p className="text-3xl font-bold text-indigo-600">{students.length}</p>
          <p className="text-sm text-gray-400 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-t-4 border-green-500 shadow-sm">
          <div className="text-2xl mb-1">📅</div>
          <p className="text-3xl font-bold text-green-600">
            {summary?.days_marked ?? "—"} / 90
          </p>
          <p className="text-sm text-gray-400 mt-1">Days Marked</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border-t-4 border-orange-400 shadow-sm">
          <div className="text-2xl mb-1">📈</div>
          <p className="text-3xl font-bold text-orange-500">
            {summary?.avg_attendance ?? "—"}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Avg Attendance</p>
        </div>
      </div>

      {/* ══ MARK VIEW ══ */}
      {view === "mark" && (
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* Date + Mark All */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="block mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mark All As</p>
              <div className="flex gap-2">
                {(["P", "HD", "A", "H"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => markAll(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition hover:opacity-80
                      ${STATUS_CONFIG[s].border} ${STATUS_CONFIG[s].text} ${STATUS_CONFIG[s].light}`}
                  >
                    {s === "P" ? "✅ Present"
                      : s === "HD" ? "⏰ Half Day"
                      : s === "A"  ? "❌ Absent"
                      : "🎉 Holiday"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />

          {/* Loading */}
          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading students...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No students found.</div>
          ) : (
            <div className="space-y-2">
              {filtered.map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                >
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={s.name}
                      photo_url={s.photo_url}
                      size={44}
                      id={s.id}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.status
                          ? `Marked: ${STATUS_CONFIG[s.status as keyof typeof STATUS_CONFIG]?.full}`
                          : "Not marked yet"}
                      </p>
                    </div>
                  </div>

                  {/* P / HD / A / H buttons */}
                  <div className="flex items-center gap-2">
                    {(["P", "HD", "A", "H"] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setStatus(s.id, st)}
                        className={`w-10 h-10 rounded-lg text-xs font-bold border-2 transition
                          ${s.status === st
                            ? `${STATUS_CONFIG[st].bg} text-white border-transparent`
                            : `bg-white ${STATUS_CONFIG[st].text} ${STATUS_CONFIG[st].border} opacity-70 hover:opacity-100`
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-5 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving || markedCount === 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
            >
              {saving ? "Saving..." : `💾 Save Attendance (${markedCount} students)`}
            </button>
            {saved && (
              <span className="text-green-600 font-semibold text-sm">✅ Saved!</span>
            )}
          </div>
        </div>
      )}

      {/* ══ SUMMARY VIEW ══ */}
      {view === "summary" && (
        <div className="bg-white rounded-2xl shadow-sm p-5">

          {/* Search */}
          <input
            type="text"
            placeholder="🔍 Search student..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />

          {!summary ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading summary...
            </div>
          ) : summary.students.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              No attendance data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {summary.students
                .filter(s =>
                  s.student_name.toLowerCase().includes(search.toLowerCase())
                )
                .sort((a, b) => b.percentage - a.percentage)
                .map(s => (
                  <div key={s.student_id} className="border border-gray-100 rounded-xl p-4">

                    {/* Row: avatar + name + percentage */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={s.student_name}
                          photo_url={s.photo_url}
                          size={44}
                          id={s.student_id}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {s.student_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            P:{s.P} · HD:{s.HD} · A:{s.A} · H:{s.H}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${pctColor(s.percentage)}`}>
                          {s.percentage}%
                        </p>
                        <p className="text-xs text-gray-400">{s.total_days} days</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          s.percentage >= 90 ? "bg-green-500"
                          : s.percentage >= 75 ? "bg-orange-400"
                          : "bg-red-500"
                        }`}
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>

                    {/* Last 10 days pills */}
                    <div className="flex gap-1 flex-wrap">
                      {s.records.slice(-10).map((r, i) => (
                        <span
                          key={i}
                          title={r.date}
                          className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white
                            ${STATUS_CONFIG[r.status as Status]?.bg ?? "bg-gray-300"}`}
                        >
                          {r.status}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}