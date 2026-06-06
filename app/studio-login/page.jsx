"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const OWNER_PIN = "191997"; // Change this to your preferred PIN

export default function StudioLogin() {
  const router = useRouter();
  const [mode, setMode] = useState("owner"); // "owner" or "studio"
  const [pin, setPin] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleOwnerLogin() {
    if (pin !== OWNER_PIN) { setError("Invalid PIN"); return; }
    localStorage.setItem("studioId", "owner");
    localStorage.setItem("studioName", "IRA Yoga Studio");
    router.push("/");
  }

  async function handleStudioLogin() {
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
    router.push("/");
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f7f4" }}>
      <div style={{ textAlign: "center", padding: "2.5rem", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: "400px" }}>
        <div style={{ fontSize: "3rem" }}>⏳</div>
        <h2 style={{ color: "#1D9E75", marginTop: "1rem" }}>Request Submitted!</h2>
        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>Your studio registration is pending approval. You will be notified once approved.</p>
        <button onClick={() => { setPending(false); setMode("studio"); }}
          style={{ marginTop: "1.5rem", padding: "0.75rem 1.5rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
          Back to Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f7f4", padding: "1rem" }}>
      <div style={{ padding: "2.5rem", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", maxWidth: "420px", width: "100%" }}>

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem" }}>🧘</div>
          <h1 style={{ color: "#1D9E75", fontSize: "1.5rem", fontWeight: 800, marginTop: "0.5rem" }}>IRA Yoga Studio</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.25rem" }}>Instructor Portal</p>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#f3f4f6", borderRadius: "10px", padding: "4px", marginBottom: "1.5rem" }}>
          {[{ id: "owner", label: "🔑 Owner" }, { id: "studio", label: "🏢 Studio Login" }].map(m => (
            <button key={m.id} onClick={() => { setMode(m.id); setError(""); }}
              style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, background: mode === m.id ? "white" : "transparent", color: mode === m.id ? "#1D9E75" : "#6b7280", boxShadow: mode === m.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none" }}>
              {m.label}
            </button>
          ))}
        </div>

        {error && <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.85rem" }}>{error}</div>}

        {/* Owner PIN login */}
        {mode === "owner" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Enter your PIN</label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                onKeyDown={e => e.key === "Enter" && handleOwnerLogin()}
                style={{ width: "100%", padding: "0.85rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "1.5rem", letterSpacing: "0.5rem", textAlign: "center", outline: "none" }}
              />
            </div>
            <button onClick={handleOwnerLogin} disabled={pin.length !== 6}
              style={{ padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", opacity: pin.length !== 6 ? 0.5 : 1 }}>
              Enter Dashboard
            </button>
          </div>
        )}

        {/* Studio email+password login */}
        {mode === "studio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {form.registering && (
              <input placeholder="Studio Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
            )}
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
            <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ padding: "0.75rem 1rem", border: "1.5px solid #e5e7eb", borderRadius: "8px", fontSize: "0.95rem", outline: "none" }} />
            <button onClick={form.registering ? handleRegister : handleStudioLogin}
              disabled={loading || !form.email || !form.password || (form.registering && !form.name)}
              style={{ padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Please wait..." : form.registering ? "Register Studio" : "Sign In"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#9ca3af" }}>
              {form.registering ? "Already registered? " : "New studio? "}
              <span onClick={() => setForm({ ...form, registering: !form.registering })}
                style={{ color: "#1D9E75", cursor: "pointer", fontWeight: 600 }}>
                {form.registering ? "Sign in" : "Register here"}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
