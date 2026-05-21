"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportSequencePDF } from "@/lib/pdfExport";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [sequence, setSequence] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const studentName = localStorage.getItem("studentName");
    if (!studentId) { router.push("/student"); return; }
    setStudent({ id: studentId, name: studentName });
    fetch(`/api/clients/${studentId}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.sequences && data.sequences.length > 0) {
          setSequence(data.sequences[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    router.push("/student");
  }

  function handlePrint() {
    if (!sequence || !student) return;
    exportSequencePDF({ name: student.name }, { ...sequence }, 6);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f7f4" }}>
      <div style={{ textAlign: "center", color: "#1D9E75" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧘</div>
        <p>Loading your plan...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", padding: "1rem" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ background: "#1D9E75", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800 }}>🧘 IRA Yoga Studio</div>
            <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "2px" }}>Welcome, {student?.name}!</div>
          </div>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
            Logout
          </button>
        </div>

        {/* Plan Card */}
        {sequence ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2018", marginBottom: "4px" }}>Your Current Asana Plan</h2>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Cycle {sequence.cycleNumber} · {sequence.style} · {sequence.duration} min</div>
              </div>
              <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: "999px" }}>Active</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>Goal</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>{sequence.goal}</div>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>Energy</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>{sequence.energy}</div>
              </div>
            </div>

            <button
              onClick={handlePrint}
              style={{ width: "100%", padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}
            >
              🖨️ Print / Download My Plan
            </button>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", padding: "2rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a2018", marginBottom: "0.5rem" }}>No Plan Yet</h2>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your instructor hasn't generated your asana plan yet. Please check back soon!</p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "1.5rem" }}>
          IRA Yoga Studio · Contact your instructor for support
        </p>
      </div>
    </div>
  );
}
