"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentLogin() {
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/student-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, pin })
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      localStorage.setItem("studentId", data.clientId);
      localStorage.setItem("studentName", data.name);
      router.push("/student/dashboard");
    } else {
      setError("Invalid phone number or PIN. Please try again.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem", width: "100%", maxWidth: "400px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🧘</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D9E75" }}>IRA Yoga Studio</h1>
          <p style={{ color: "#6b7280", fontSize: "0.9rem", marginTop: "0.25rem" }}>Student Portal</p>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Phone Number</label>
          <input
            type="tel"
            placeholder="Enter your phone number"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "1rem", outline: "none" }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>PIN</label>
          <input
            type="password"
            placeholder="Enter your 4-digit PIN"
            value={pin}
            maxLength={4}
            onChange={e => setPin(e.target.value)}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "1rem", outline: "none" }}
          />
        </div>
        {error && <div style={{ color: "#DC2626", fontSize: "0.85rem", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
        <button
          onClick={handleLogin}
          disabled={loading || !phone || !pin}
          style={{ width: "100%", padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Logging in..." : "View My Plan"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#9ca3af", marginTop: "1.5rem" }}>Contact your instructor for login details</p>
      </div>
    </div>
  );
}
