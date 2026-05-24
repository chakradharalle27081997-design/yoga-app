"use client";
import { useState } from "react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [studios, setStudios] = useState([]);

  async function login() {
    const res = await fetch("/api/admin/studios?password=" + password);
    if (res.ok) {
      const data = await res.json();
      setStudios(data.studios);
      setAuthed(true);
    } else {
      alert("Wrong password!");
    }
  }

  async function updateStatus(id, status) {
    await fetch("/api/admin/studios?password=" + password, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status })
    });
    const res = await fetch("/api/admin/studios?password=" + password);
    const data = await res.json();
    setStudios(data.studios);
  }

  if (!authed) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9f5f0" }}>
      <div style={{ padding: "40px", background: "white", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", maxWidth: "360px", width: "100%" }}>
        <h2 style={{ color: "#2d6a4f", textAlign: "center" }}>🔐 IRA Yoga Admin</h2>
        <input type="password" placeholder="Admin Password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", border: "1px solid #ddd", borderRadius: "8px", marginTop: "24px", fontSize: "16px", boxSizing: "border-box" }} />
        <button onClick={login} style={{ width: "100%", padding: "14px", background: "#2d6a4f", color: "white", border: "none", borderRadius: "8px", marginTop: "16px", fontSize: "16px", cursor: "pointer" }}>
          Login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: "32px", background: "#f9f5f0", minHeight: "100vh" }}>
      <h1 style={{ color: "#2d6a4f" }}>🧘 IRA Yoga — Studio Management</h1>
      <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", marginTop: "24px" }}>
        <thead>
          <tr style={{ background: "#2d6a4f", color: "white" }}>
            <th style={{ padding: "14px", textAlign: "left" }}>Studio Name</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Email</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Students</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Status</th>
            <th style={{ padding: "14px", textAlign: "left" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {studios.map((s, i) => (
            <tr key={s.id} style={{ borderBottom: "1px solid #eee", background: i % 2 === 0 ? "white" : "#f9f9f9" }}>
              <td style={{ padding: "12px" }}>{s.name}</td>
              <td style={{ padding: "12px" }}>{s.email}</td>
              <td style={{ padding: "12px" }}>{s._count.clients}</td>
              <td style={{ padding: "12px" }}>
                <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "13px",
                  background: s.status === "approved" ? "#d4edda" : s.status === "pending" ? "#fff3cd" : "#f8d7da",
                  color: s.status === "approved" ? "#155724" : s.status === "pending" ? "#856404" : "#721c24" }}>
                  {s.status}
                </span>
              </td>
              <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                {s.status !== "approved" && (
                  <button onClick={() => updateStatus(s.id, "approved")}
                    style={{ padding: "6px 12px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Approve
                  </button>
                )}
                {s.status === "approved" && (
                  <button onClick={() => updateStatus(s.id, "suspended")}
                    style={{ padding: "6px 12px", background: "#dc3545", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Suspend
                  </button>
                )}
                {s.status === "suspended" && (
                  <button onClick={() => updateStatus(s.id, "approved")}
                    style={{ padding: "6px 12px", background: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                    Reactivate
                  </button>
                )}
              </td>
            </tr>
          ))}
          {studios.length === 0 && (
            <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#999" }}>No studios registered yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
