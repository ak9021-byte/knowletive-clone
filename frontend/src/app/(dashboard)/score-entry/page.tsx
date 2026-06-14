"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";
import { Student } from "@/types";

const CRITERIA = [
  { key: "personality",         label: "Personality",         emoji: "🌟", max: 10 },
  { key: "formals",             label: "Formals",             emoji: "👔", max: 10 },
  { key: "cleanliness",         label: "Cleanliness",         emoji: "🧹", max: 10 },
  { key: "socks",               label: "Socks",               emoji: "🧦", max: 10 },
  { key: "shoes",               label: "Shoes",               emoji: "👟", max: 10 },
  { key: "attentive",           label: "Attentive",           emoji: "👁️", max: 10 },
  { key: "interactive",         label: "Interactive",         emoji: "🤝", max: 10 },
  { key: "communication",       label: "Communication",       emoji: "💬", max: 10 },
  { key: "confidence",          label: "Confidence",          emoji: "💪", max: 10 },
  { key: "technical_knowledge", label: "Technical Knowledge", emoji: "💻", max: 10 },
];

const emptyScores = () =>
  Object.fromEntries(CRITERIA.map(c => [c.key, 0])) as Record<string, number>;

export default function ScoreEntryPage() {
  const [faculty, setFaculty] = useState<{ id: number; name: string } | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(emptyScores());
  const [attendance, setAttendance] = useState("P");
  const [topicName, setTopicName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [search, setSearch] = useState("");
  const [showList, setShowList] = useState(false); // mobile: toggle list

  useEffect(() => {
    const f = getFaculty();
    setFaculty(f);
    if (f) {
      api.get(`/students/?faculty_id=${f.id}`).then(r => {
        setStudents(r.data);
        if (r.data.length > 0) setSelected(r.data[0]);
      });
    }
  }, []);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const getLevel = (t: number) => {
    if (t >= 80) return { label: "Pro",      color: "#16a34a", bg: "#dcfce7" };
    if (t >= 50) return { label: "Learner",  color: "#d97706", bg: "#fef3c7" };
    return           { label: "Beginner", color: "#dc2626", bg: "#fee2e2" };
  };

  const handleSubmit = async () => {
    if (!selected || !faculty) return;
    setSaving(true);
    try {
      await api.post(`/scores/?faculty_id=${faculty.id}`, {
        student_id: selected.id, date, attendance,
        topic_name: topicName, ...scores,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setScores(emptyScores());
      setShowList(false);
    } catch {
      alert("Error saving score");
    } finally {
      setSaving(false);
    }
  };

  const level = getLevel(total);
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        .se-layout { display: flex; gap: 24px; align-items: flex-start; }
        .se-sidebar { width: 256px; flex-shrink: 0; }
        .se-form { flex: 1; min-width: 0; }
        .se-mobile-toggle { display: none; }
        .score-btn { width: 36px; height: 36px; font-size: 0.85rem; }

        @media (max-width: 768px) {
          .se-layout { flex-direction: column; gap: 0; }
          .se-sidebar {
            width: 100%;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            z-index: 50;
            border-radius: 20px 20px 0 0;
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 -8px 32px rgba(0,0,0,0.15);
            transform: translateY(100%);
            transition: transform 0.3s ease;
          }
          .se-sidebar.open { transform: translateY(0); }
          .se-mobile-toggle {
            display: flex;
            position: fixed;
            bottom: 20px; right: 20px;
            z-index: 60;
            width: 56px; height: 56px;
            border-radius: 50%;
            background: #4f46e5;
            color: white;
            font-size: 1.4rem;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(79,70,229,0.5);
            border: none;
            cursor: pointer;
          }
          .se-form { width: 100%; padding-bottom: 100px; }
          .score-btn { width: 32px; height: 32px; font-size: 0.8rem; }
          .student-header { flex-wrap: wrap; gap: 12px; }
          .att-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-3 md:p-6">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-4 md:mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">📝 Score Entry</h1>
            <p className="text-gray-500 text-xs md:text-sm">Tap a number to select score. Max 10 per criteria.</p>
          </div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
            style={{ color: "#1e293b" }}
          />
        </div>

        <div className="se-layout">

          {/* ── Student Sidebar ── */}
          <div className={`se-sidebar bg-white rounded-xl shadow-sm p-3 ${showList ? "open" : ""}`}>
            {/* Mobile handle */}
            <div className="md:hidden w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />

            <div className="flex items-center justify-between mb-3">
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                {students.length} Students
              </span>
              {selected && (
                <span className="text-xs text-gray-500 truncate max-w-[120px]">
                  ✅ {selected.name.split(" ")[0]}
                </span>
              )}
            </div>

            <input
              type="text"
              placeholder="🔍 Search student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
              style={{ color: "#1e293b" }}
            />

            <div className="space-y-1 overflow-y-auto" style={{ maxHeight: "50vh" }}>
              {filtered.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelected(s);
                    setScores(emptyScores());
                    setShowList(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition
                    ${selected?.id === s.id
                      ? "bg-indigo-50 border border-indigo-200"
                      : "hover:bg-gray-50 border border-transparent"}`}
                >
                  <span className="text-xs text-gray-400 w-5 flex-shrink-0">{i + 1}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: `hsl(${(s.id * 47) % 360},60%,55%)` }}
                  >
                    {s.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  {selected?.id === s.id && (
                    <span className="text-indigo-500 ml-auto flex-shrink-0">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Score Form ── */}
          <div className="se-form bg-white rounded-xl shadow-sm p-4 md:p-6">
            {!selected ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">👆</p>
                <p className="font-semibold">Select a student to begin</p>
                <p className="text-xs mt-1">Tap the 👥 button below on mobile</p>
              </div>
            ) : (
              <>
                {/* Student header */}
                <div className="student-header flex items-center justify-between mb-5 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                      style={{ background: `hsl(${(selected.id * 47) % 360},60%,55%)` }}
                    >
                      {selected.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-base">{selected.name}</h2>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{selected.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-indigo-600 leading-none">{total}</p>
                    <p className="text-xs text-gray-400">/ 100</p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ color: level.color, background: level.bg }}
                    >
                      {level.label}
                    </span>
                  </div>
                </div>

                {/* Attendance */}
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">Attendance</label>
                  <div className="att-row flex gap-2">
                    {[
                      { v: "P",    label: "Present",  grad: "linear-gradient(135deg,#059669,#10b981)" },
                      { v: "A",    label: "Absent",   grad: "linear-gradient(135deg,#dc2626,#ef4444)" },
                      { v: "Late", label: "Late",     grad: "linear-gradient(135deg,#d97706,#f59e0b)" },
                      { v: "HD",   label: "Half Day", grad: "linear-gradient(135deg,#2563eb,#3b82f6)" },
                    ].map(({ v, label, grad }) => (
                      <button
                        key={v}
                        onClick={() => setAttendance(v)}
                        className="flex-1 py-2 rounded-lg font-semibold text-sm transition border"
                        style={attendance === v
                          ? { background: grad, color: "#fff", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }
                          : { background: "#f8fafc", color: "#6b7280", border: "1px solid #e2e8f0" }
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Topic */}
                <div className="mb-5">
                  <label className="text-sm font-semibold text-gray-600 mb-2 block">📖 Topic Name</label>
                  <input
                    type="text"
                    value={topicName}
                    onChange={e => setTopicName(e.target.value)}
                    placeholder="e.g. React Hooks, Python Basics..."
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    style={{ color: "#1e293b" }}
                  />
                </div>

                {/* Criteria */}
                <div className="space-y-4">
                  {CRITERIA.map(c => (
                    <div key={c.key}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {c.emoji} {c.label}
                        </span>
                        <span className="text-sm font-black text-indigo-600">
                          {scores[c.key]}
                          <span className="text-gray-300 font-normal">/{c.max}</span>
                        </span>
                      </div>
                      {/* Score bar visual */}
                      <div className="mb-1.5 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${(scores[c.key] / c.max) * 100}%`,
                            background: scores[c.key] >= 8
                              ? "#10b981"
                              : scores[c.key] >= 5
                              ? "#f59e0b"
                              : scores[c.key] > 0
                              ? "#ef4444"
                              : "#e5e7eb",
                          }}
                        />
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {Array.from({ length: c.max }, (_, i) => i + 1).map(n => (
                          <button
                            key={n}
                            onClick={() => setScores({ ...scores, [c.key]: n })}
                            className="score-btn rounded-lg font-bold border transition"
                            style={scores[c.key] === n
                              ? {
                                  background: n >= 8 ? "#10b981" : n >= 5 ? "#f59e0b" : "#ef4444",
                                  color: "#fff",
                                  border: "none",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                                }
                              : {
                                  background: "#f8fafc",
                                  color: "#6b7280",
                                  border: "1px solid #e2e8f0",
                                }
                            }
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="w-full py-3.5 rounded-xl font-bold text-white transition text-base"
                    style={{
                      background: saving
                        ? "#a5b4fc"
                        : "linear-gradient(135deg,#4f46e5,#7c3aed)",
                      boxShadow: saving ? "none" : "0 4px 20px rgba(79,70,229,0.35)",
                    }}
                  >
                    {saving ? "⏳ Saving..." : `✅ Submit ${selected.name.split(" ")[0]}'s Score — ${total}/100`}
                  </button>
                  {success && (
                    <div className="flex items-center justify-center gap-2 py-2 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-green-600 font-semibold text-sm">✅ Score saved successfully!</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Mobile floating button to open student list ── */}
        <button
          className="se-mobile-toggle"
          onClick={() => setShowList(!showList)}
          title="Select Student"
        >
          {showList ? "✕" : "👥"}
        </button>

        {/* ── Mobile backdrop ── */}
        {showList && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
            onClick={() => setShowList(false)}
          />
        )}
      </div>
    </>
  );
}