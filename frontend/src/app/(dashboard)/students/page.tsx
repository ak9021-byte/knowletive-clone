"use client";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { getFaculty } from "@/lib/auth";
import { Student } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function Avatar({ student, size = 48 }: { student: Student; size?: number }) {
  const src = student.photo_url
    ? student.photo_url.startsWith("http")
      ? student.photo_url
      : `${API_BASE}${student.photo_url}`
    : null;

  if (src) {
    return (
      <img
        src={src}
        alt={student.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0 border-2 border-indigo-100"
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size,
        background: `hsl(${(student.id * 47) % 360}, 60%, 55%)`,
      }}
      className="rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
    >
      <span style={{ fontSize: size * 0.4 }}>
        {student.name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

// ── Edit Modal ──────────────────────────────────────────────
function EditModal({
  student,
  onClose,
  onSaved,
}: {
  student: Student;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName]         = useState(student.name);
  const [email, setEmail]       = useState(student.email);
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    student.photo_url
      ? student.photo_url.startsWith("http")
        ? student.photo_url
        : `${API_BASE}${student.photo_url}`
      : null
  );
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      let photo_url = student.photo_url ?? null;

      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const res = await api.post("/upload/photo", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photo_url = res.data.url;
      }

      await api.patch(`/students/${student.id}`, { name, email, photo_url });
      onSaved();
      onClose();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Edit Student</h2>

        {/* Photo */}
        <div className="flex flex-col items-center mb-5">
          <div
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 transition overflow-hidden mb-2"
          >
            {photoPreview ? (
              <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
            ) : (
              <div className="text-center">
                <span className="text-3xl">📷</span>
                <p className="text-xs text-indigo-300 mt-1">Upload</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Change Photo
          </button>
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Full Name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Email */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-medium text-sm hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || !name || !email}
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────
export default function StudentsPage() {
  const faculty = getFaculty();
  const [students, setStudents]       = useState<Student[]>([]);
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [photoFile, setPhotoFile]     = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [adding, setAdding]           = useState(false);
  const [search, setSearch]           = useState("");
  const [editing, setEditing]         = useState<Student | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (faculty)
      api.get(`/students/?faculty_id=${faculty.id}`).then(r => setStudents(r.data));
  };

  useEffect(() => { load(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const addStudent = async () => {
    if (!name || !email || !faculty) return;
    setAdding(true);
    try {
      let photo_url: string | null = null;
      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const res = await api.post("/upload/photo", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        photo_url = res.data.url;
      }
      await api.post(`/students/?faculty_id=${faculty.id}`, { name, email, photo_url });
      setName(""); setEmail("");
      setPhotoFile(null); setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Error adding student");
    } finally {
      setAdding(false);
    }
  };

  const removeStudent = async (id: number) => {
    if (!confirm("Remove this student?")) return;
    await api.delete(`/students/${id}`);
    load();
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Edit Modal */}
      {editing && (
        <EditModal
          student={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Students</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your student roster</p>
      </div>

      {/* Add Student Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">
          Add New Student
        </h2>
        <div className="flex gap-5 items-start">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 flex items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-100 transition overflow-hidden"
            >
              {photoPreview ? (
                <img src={photoPreview} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <div className="text-center">
                  <span className="text-2xl">📷</span>
                  <p className="text-xs text-indigo-300 mt-1">Photo</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            {photoPreview && (
              <button
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>

          {/* Name + Email */}
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Full Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Akash Gaikwad"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="e.g. akash@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-end h-full pt-6">
            <button
              onClick={addStudent}
              disabled={adding || !name || !email}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-6 py-3 rounded-xl font-semibold text-sm transition flex items-center gap-2 whitespace-nowrap"
            >
              {adding ? "Adding..." : "+ Add Student"}
            </button>
          </div>
        </div>
      </div>

      {/* Stats + Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-xl">
          {students.length} Students
        </div>
        <input
          type="text" placeholder="Search by name or email..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Student Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
          <p className="text-gray-500 font-semibold">No students yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first student above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(s => (
            <div key={s.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <Avatar student={s} size={52} />
                <div>
                  <p className="font-bold text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{s.email}</p>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1.5 inline-block"
                    style={{ color: "#d97706", background: "#fef3c7" }}>
                    Beginner
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 items-end">
                {/* ✅ Edit button */}
                <button
                  onClick={() => setEditing(s)}
                  className="flex items-center gap-1.5 text-indigo-500 hover:text-indigo-700 border border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50 px-3 py-2 rounded-xl text-sm transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => removeStudent(s.id)}
                  className="flex items-center gap-1.5 text-red-400 hover:text-red-600 border border-red-100 hover:border-red-300 hover:bg-red-50 px-3 py-2 rounded-xl text-sm transition"
                >
                  🗑️ Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}