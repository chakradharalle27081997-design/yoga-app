"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudioLogin() {
  const router = useRouter();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleLogin() {
    setLoading(true); setError("");
    const res = await fetch("/api/studio", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.email, password: form.password })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    localStorage.setItem("studioId", data.studio.id);
    localStorage.setItem("studioName", data.studio.name);
    localStorage.setItem("studioEmail", data.studio.email);
    router.push("/clients");
  }

  async function handleRegister() {
    setLoading(true); setError("");
    const res = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setPending(true);
  }

  if (pending) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f5f0" }}>
      <div style={{ textAlign: "center", padding: "40px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "400px" }}>
        <div style={{ fontSize: "48px" }}>⏳</div>
        <h2 style={{ color: "#2d6a4f", marginTop: "16px" }}>Request Submitted!</h2>
        <p style={{ color: "#666", marginTop: "8px" }}>Your studio registration is pending approval from IRA Yoga. You will be notified once approved.</p>
        <button onClick={() => { setPending(false); setMode("login"); }}
          style={{ marginTop: "24px", padding: "12px 24px", background: "#2d6a4f", color: "white", border: "none", borderRadius: "8px", cursor: "pointer" }}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f5f0" }}>
      <div style={{ padding: "40px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "400px", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#2d6a4f", fontSize: "28px" }}>🧘 IRA Yoga Studio</h1>
          <p style={{ color: "#666", marginTop: "8px" }}>{mode === "login" ? "Sign in to your studio" : "Register your studio"}</p>
        </div>
        {error && <div style={{ background: "#fdecea", color: "#c0392b", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <input placeholder="Studio Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} />
          )}
          <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} />
          <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            style={{ padding: "12px", border: "1px solid #ddd", borderRadius: "8px", fontSize: "16px" }} />
          <button onClick={mode === "login" ? handleLogin : handleRegister}
            disabled={loading || !form.email || !form.password || (mode === "register" && !form.name)}
            style={{ padding: "14px", background: "#2d6a4f", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register Studio"}
          </button>
        </div>
        <p style={{ textAlign: "center", marginTop: "20px", color: "#999", fontSize: "14px" }}>
          {mode === "login" ? "New studio? " : "Already registered? "}
          <span onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ color: "#2d6a4f", cursor: "pointer", fontWeight: "600" }}>
            {mode === "login" ? "Register here" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
