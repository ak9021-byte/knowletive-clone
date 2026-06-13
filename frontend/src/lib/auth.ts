export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getFaculty = () => {
  if (typeof window === "undefined") return null;
  const f = localStorage.getItem("faculty");
  return f ? JSON.parse(f) : null;
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("faculty");
  localStorage.removeItem("student");   // ✅ added
  window.location.href = "/";
};

export const isLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

// ✅ NEW — student helpers
export const getStudent = () => {
  if (typeof window === "undefined") return null;
  const s = localStorage.getItem("student");
  return s ? JSON.parse(s) : null;
};

export const isStudentLoggedIn = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("student");
};