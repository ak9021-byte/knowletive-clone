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
      {/* ── LEFT HERO ── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)" }}
      >
        {/* Decorative glowing orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)" }} />
        <div className="absolute bottom-[-15%] left-[-10%] w-[380px] h-[380px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(45,212,191,0.25), transparent 70%)" }} />
        <div className="absolute top-1/3 left-1/4 w-[260px] h-[260px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.18), transparent 70%)" }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />

        <div className="relative z-10">
          {/* Brand mark */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-white font-extrabold text-lg leading-none">Knowletive</p>
              <p className="text-indigo-300 text-xs mt-0.5">Training Minds, Placing Talents</p>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-white leading-tight">
            TRACK STUDENT<br />
            <span style={{
              background: "linear-gradient(90deg,#2dd4bf,#818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Performance</span><br />
            <span className="text-slate-400 text-3xl">with Precision</span>
          </h1>
          <p className="text-slate-400 mt-6 text-lg max-w-md">
            A complete scoring system for modern learning programs — daily evaluation, attendance, and live leaderboards in one place.
          </p>

          <div className="flex gap-3 mt-8 flex-wrap">
            {["Daily Scoring","Leaderboard","10 Metrics","Free Forever"].map(t => (
              <span key={t}
                className="px-3 py-1.5 rounded-full border text-sm backdrop-blur-sm"
                style={{ borderColor: "rgba(99,102,241,0.35)", background: "rgba(99,102,241,0.08)", color: "#c7d2fe" }}>
                {t}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12 max-w-md">
            {[["10","Score Criteria","#a855f7"],["100","Max Points","#2dd4bf"],["Live","Leaderboard","#f59e0b"],["100%","Free to Use","#60a5fa"]].map(([v,l,c]) => (
              <div key={l as string}
                className="rounded-2xl p-5 backdrop-blur-sm border"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                <p className="text-3xl font-bold" style={{ color: c as string }}>{v}</p>
                <p className="text-slate-400 text-xs mt-1 uppercase tracking-wide">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT LOGIN ── */}
      <div className="w-full lg:w-[440px] flex items-center justify-center bg-white px-8 py-12 relative">
        {/* subtle top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: "linear-gradient(90deg,#6366f1,#2dd4bf,#a855f7)" }} />

        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden"
              style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}>
              <img src="/logo.png" alt="Knowletive" className="w-full h-full object-contain p-1" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-500 text-sm mt-1">Sign in to continue your journey</p>
          </div>

          <div className="flex justify-center gap-4 mb-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">🔒 SSL Encrypted</span>
            <span className="flex items-center gap-1">🛡️ GDPR Safe</span>
            <span className="flex items-center gap-1">✅ 100% Free</span>
          </div>

          <div className="flex rounded-xl border border-gray-200 p-1 mb-6 bg-gray-50">
            <button
              onClick={() => { setTab("faculty"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${tab === "faculty" ? "text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
              style={tab === "faculty" ? { background: "linear-gradient(135deg,#14b8a6,#0d9488)" } : {}}
            >
              🏫 Faculty
            </button>
            <button
              onClick={() => { setTab("student"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all
                ${tab === "student" ? "text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
              style={tab === "student" ? { background: "linear-gradient(135deg,#a855f7,#9333ea)" } : {}}
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
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
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
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition"
                />
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">⚠️ {error}</p>
              )}
              <button
                onClick={handleFacultyLogin}
                disabled={loading}
                className="w-full text-white py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#14b8a6,#0d9488)" }}
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
                  className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use the email registered by your faculty
                </p>
              </div>
              {error && (
                <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">⚠️ {error}</p>
              )}
              <button
                onClick={handleStudentLogin}
                disabled={loading}
                className="w-full text-white py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#a855f7,#9333ea)" }}
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