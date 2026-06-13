"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";

export default function LeaderboardPage() {
  const faculty = getFaculty();
  const [data, setData] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!faculty) return;
    Promise.all([
      api.get("/scores/leaderboard"),
      api.get(`/students/?faculty_id=${faculty.id}`)
    ]).then(([lb, st]) => {
      setData(lb.data);
      setStudents(st.data);
    });
  }, []);

  const getName = (id: number) =>
    students.find(s => s.id === id)?.name || `Student #${id}`;

  const medals = ["🥇","🥈","🥉"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">Rankings based on total scores</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {data.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📭</p>
            <p>No scores yet. Start entering scores!</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rank</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Student</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Total Score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.student_id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-xl">
                    {medals[i] || `#${i + 1}`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {getName(row.student_id).charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{getName(row.student_id)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-indigo-600 text-lg">{row.total_score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}