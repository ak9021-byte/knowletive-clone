"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";
import { Student } from "@/types";

const CRITERIA = [
  { key: "personality",         label: "Personality",          emoji: "🌟", max: 10 },
  { key: "formals",             label: "Formals",              emoji: "👔", max: 10 },
  { key: "cleanliness",         label: "Cleanliness",          emoji: "🧹", max: 10 },
  { key: "socks",               label: "Socks",                emoji: "🧦", max: 10 },
  { key: "shoes",               label: "Shoes",                emoji: "👟", max: 10 },
  { key: "attentive",           label: "Attentive",            emoji: "👁️", max: 10 },
  { key: "interactive",         label: "Interactive",          emoji: "🤝", max: 10 },
  { key: "communication",       label: "Communication",        emoji: "💬", max: 10 },
  { key: "confidence",          label: "Confidence",           emoji: "💪", max: 10 },
  { key: "technical_knowledge", label: "Technical Knowledge",  emoji: "💻", max: 10 },
];

const emptyScores = () =>
  Object.fromEntries(CRITERIA.map(c => [c.key, 0])) as Record<string, number>;

export default function ScoreEntryPage() {
  const faculty = getFaculty();
  const [students, setStudents] = useState<Student[]>([]);
  const [selected, setSelected] = useState<Student | null>(null);
  const [scores, setScores] = useState<Record<string, number>>(emptyScores());
  const [attendance, setAttendance] = useState("P");
  const [topicName, setTopicName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (faculty) {
      api.get(`/students/?faculty_id=${faculty.id}`)
        .then(r => {
          setStudents(r.data);
          if (r.data.length > 0) setSelected(r.data[0]);
        });
    }
  }, []);

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const getLevel = (t: number) => {
    if (t >= 80) return { label: "Pro", color: "text-green-600" };
    if (t >= 50) return { label: "Learner", color: "text-yellow-500" };
    return { label: "Beginner", color: "text-red-500" };
  };

  const handleSubmit = async () => {
    if (!selected || !faculty) return;
    setSaving(true);
    try {
      await api.post(`/scores/?faculty_id=${faculty.id}`, {
        student_id: selected.id,
        date,
        attendance,
        topic_name: topicName,
        ...scores,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setScores(emptyScores());
    } catch (e) {
      alert("Error saving score");
    } finally {
      setSaving(false);
    }
  };

  const level = getLevel(total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📝 Score Entry</h1>
          <p className="text-gray-500 text-sm">Click a score to select. Max 10 per criteria.</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex gap-6">
        {/* Student List */}
        <div className="w-64 bg-white rounded-xl shadow-sm p-3">
          <div className="flex gap-2 mb-3 text-xs font-semibold">
            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
              {students.length} Total
            </span>
          </div>
          <input
            type="text"
            placeholder="Search student..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
          />
          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {students.map((s, i) => (
              <button
                key={s.id}
                onClick={() => { setSelected(s); setScores(emptyScores()); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition
                  ${selected?.id === s.id ? "bg-indigo-50 border border-indigo-200" : "hover:bg-gray-50"}`}
              >
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate w-32">{s.name}</p>
                  <p className="text-xs text-gray-400">-/100</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Score Form */}
        {selected && (
          <div className="flex-1 bg-white rounded-xl shadow-sm p-6">
            {/* Student header */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold text-lg">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-gray-800">{selected.name}</h2>
                  <p className="text-xs text-gray-400">{selected.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-indigo-600">{total}</p>
                <p className="text-xs text-gray-400">/ 100</p>
                <p className={`text-sm font-bold ${level.color}`}>{level.label}</p>
              </div>
            </div>

            {/* Attendance */}
            <div className="mb-4">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Attendance</label>
              <div className="flex gap-2">
                {[
                  { v: "P", label: "Present", color: "bg-green-500" },
                  { v: "A", label: "Absent", color: "bg-red-500" },
                  { v: "Late", label: "Late", color: "bg-yellow-400" },
                ].map(({ v, label, color }) => (
                  <button
                    key={v}
                    onClick={() => setAttendance(v)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition
                      ${attendance === v ? `${color} text-white` : "bg-gray-100 text-gray-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Topic */}
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-600 mb-2 block">Topic Name</label>
              <input
                type="text"
                value={topicName}
                onChange={e => setTopicName(e.target.value)}
                placeholder="e.g. React Hooks, Python Basics..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {/* Criteria */}
            <div className="space-y-4">
              {CRITERIA.map(c => (
                <div key={c.key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {c.emoji} {c.label}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {scores[c.key]}/{c.max}
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {Array.from({ length: c.max }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setScores({ ...scores, [c.key]: n })}
                        className={`w-9 h-9 rounded-lg text-sm font-semibold border transition
                          ${scores[c.key] === n
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-gray-50 border-gray-200 hover:bg-indigo-50 hover:border-indigo-300"
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition"
              >
                {saving ? "Saving..." : `✅ Submit ${selected.name.split(" ")[0]}'s Score`}
              </button>
              {success && (
                <span className="text-green-600 font-semibold text-sm">
                  ✅ Score saved!
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}