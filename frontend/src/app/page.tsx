"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"faculty" | "student">("faculty");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFacultyLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("faculty", JSON.stringify(res.data.faculty));
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async () => {
    if (!email) { setError("Please enter your email"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/students/by-email?email=${encodeURIComponent(email)}`);
      console.log("STUDENT DATA:", res.data);
      if (!res.data?.id) {
        setError("Invalid student data received");
        return;
      }
      localStorage.setItem("student", JSON.stringify(res.data));
      router.push(`/student/${res.data.id}`);
    } catch {
      setError("Email not found. Ask your faculty to add you first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-gray-900 flex-col justify-center px-16">
        <h1 className="text-5xl font-bold text-white leading-tight">
          TRACK STUDENT<br />
          <span className="text-teal-400">Performance</span><br />
          <span className="text-gray-300 text-3xl">with Precision</span>
        </h1>
        <p className="text-gray-400 mt-6 text-lg">
          A complete scoring system for modern learning programs.
        </p>
        <div className="flex gap-4 mt-8">
          {["Daily Scoring","Leaderboard","10 Metrics","Free Forever"].map(t => (
            <span key={t} className="px-3 py-1 rounded-full border border-gray-600 text-gray-400 text-sm">
              • {t}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6 mt-12">
          {[["10","Score Criteria"],["100","Max Points"],["Live","Leaderboard"],["100%","Free to Use"]].map(([v,l]) => (
            <div key={l} className="bg-gray-800 rounded-xl p-5">
              <p className="text-3xl font-bold text-white">{v}</p>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-wide">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-[420px] flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">📚</div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue your journey</p>
          </div>

          <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500">
            <span>🔒 SSL Encrypted</span>
            <span>🛡️ GDPR Safe</span>
            <span>✅ 100% Free</span>
          </div>

          <div className="flex rounded-xl border border-gray-200 p-1 mb-6">
            <button
              onClick={() => { setTab("faculty"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab === "faculty" ? "bg-teal-500 text-white" : "text-gray-500"}`}
            >
              🏫 Faculty
            </button>
            <button
              onClick={() => { setTab("student"); setError(""); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
                ${tab === "student" ? "bg-purple-500 text-white" : "text-gray-500"}`}
            >
              👤 Student
            </button>
          </div>

          {tab === "faculty" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleFacultyLogin()}
                  placeholder="Enter your username"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleFacultyLogin()}
                  placeholder="Enter your password"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
              <button
                onClick={handleFacultyLogin}
                disabled={loading}
                className="w-full bg-teal-500 hover:bg-teal-600 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Signing in..." : "Sign In →"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleStudentLogin()}
                  placeholder="yourname@email.com"
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use the email registered by your faculty
                </p>
              </div>
              {error && <p className="text-red-500 text-sm">⚠️ {error}</p>}
              <button
                onClick={handleStudentLogin}
                disabled={loading}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition"
              >
                {loading ? "Looking up..." : "View My Performance →"}
              </button>
            </div>
          )}

          <p className="text-center text-xs text-gray-400 mt-6">
            🔒 Secure & confidential — your data is protected<br />
            © 2025 Knowletive. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}