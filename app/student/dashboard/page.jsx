"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportSequencePDF } from "@/lib/pdfExport";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [sequences, setSequences] = useState([]);
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
        if (data && data.sequences) setSequences(data.sequences);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleLogout() {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    router.push("/student");
  }

  function handlePrint(seq) {
    exportSequencePDF({ name: student.name }, { ...seq }, seq.asanaCount || 6);
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  function getPlanDates(seq) {
    const start = new Date(seq.createdAt);
    const end = new Date(start);
    end.setDate(end.getDate() + 9);
    return { start, end };
  }

  function getPlanStatus(seq) {
    const { end } = getPlanDates(seq);
    return new Date() <= end ? "active" : "completed";
  }

  const currentPlan = sequences.find(s => getPlanStatus(s) === "active");
  const pastPlans = sequences.filter(s => getPlanStatus(s) === "completed");

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

        {/* Current Plan */}
        {currentPlan ? (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2018", marginBottom: "4px" }}>Current Asana Plan</h2>
                <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>Cycle {currentPlan.cycleNumber} · {currentPlan.style} · {currentPlan.duration} min</div>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>
                  {formatDate(getPlanDates(currentPlan).start)} — {formatDate(getPlanDates(currentPlan).end)}
                </div>
              </div>
              <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: "999px" }}>🟢 Active</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>Goal</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>{currentPlan.goal}</div>
              </div>
              <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "2px" }}>Energy</div>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>{currentPlan.energy}</div>
              </div>
            </div>
            <button onClick={() => handlePrint(currentPlan)} style={{ width: "100%", padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
              🖨️ Print / Download My Plan
            </button>
          </div>
        ) : (
          <div style={{ background: "white", borderRadius: "16px", padding: "2rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📋</div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "#1a2018", marginBottom: "0.5rem" }}>No Active Plan</h2>
            <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your instructor hasn't generated your asana plan yet. Please check back soon!</p>
          </div>
        )}

        {/* Past Plans */}
        {pastPlans.length > 0 && (
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018", marginBottom: "1rem" }}>📚 Past Cycles</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pastPlans.map(seq => (
                <div key={seq.id} style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>Cycle {seq.cycleNumber} — {seq.style}</div>
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>
                      {formatDate(getPlanDates(seq).start)} — {formatDate(getPlanDates(seq).end)} · {seq.goal}
                    </div>
                  </div>
                  <button onClick={() => handlePrint(seq)} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", color: "#374151" }}>
                    🖨️ Print
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "1.5rem" }}>
          IRA Yoga Studio · Contact your instructor for support
        </p>
      </div>
    </div>
  );
}
