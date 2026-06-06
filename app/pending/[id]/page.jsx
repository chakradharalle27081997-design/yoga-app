"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function PendingReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [pin, setPin] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetch("/api/clients/" + id).then(r => r.json()).then(setClient);
  }, [id]);

  async function handleApprove() {
    if (!pin || pin.length !== 4) return alert("Please set a 4-digit PIN for this student");
    setApproving(true);
    await fetch("/api/clients/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...client, registrationStatus: "approved", pin }),
    });
    setApproving(false);
    router.push("/");
  }

  async function handleReject() {
    if (!confirm("Reject and delete this registration?")) return;
    setRejecting(true);
    await fetch("/api/clients/" + id, { method: "DELETE" });
    setRejecting(false);
    router.push("/");
  }

  if (!client) return <div style={{ padding: "3rem", textAlign: "center" }}>Loading...</div>;

  const fields = [
    ["Name", client.name],
    ["Age", client.age],
    ["Gender", client.gender],
    ["Phone", client.phone],
    ["Experience", client.experience],
    ["Goals", client.goals],
    ["Conditions", client.conditions || "None"],
    ["Injuries", client.injuries || "None"],
    ["Surgeries", client.surgeries || "None"],
    ["Family History", client.familyHistory || "None"],
    ["Stress Level", client.stressLevel || "—"],
    ["Sleep Pattern", client.sleepPattern || "—"],
    ["Meal Type", client.mealType || "—"],
    ["Notes", client.notes || "—"],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", padding: "1rem" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <div style={{ background: "#6366F1", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem", color: "white" }}>
          <div style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "4px" }}>Pending Registration Review</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800 }}>{client.name}</h1>
          <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>📱 {client.phone} · Age {client.age} · {client.experience}</div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a2018" }}>Student Details</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {fields.map(([label, value]) => (
              <div key={label} style={{ display: "flex", gap: "0.75rem", fontSize: "0.85rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#6b7280", minWidth: "110px", fontWeight: 600 }}>{label}:</span>
                <span style={{ color: "#1a2018" }}>{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: "#1a2018" }}>Set Student PIN</h2>
          <p style={{ fontSize: "0.82rem", color: "#6b7280", marginBottom: "0.75rem" }}>This PIN will be shared with the student to login to their portal.</p>
          <input
            type="text"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
            style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontSize: "1.2rem", letterSpacing: "0.5rem", textAlign: "center", outline: "none" }}
          />
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={handleReject} disabled={rejecting}
            style={{ flex: 1, padding: "0.85rem", background: "#FEE2E2", color: "#DC2626", border: "2px solid #FCA5A5", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}>
            {rejecting ? "Rejecting..." : "❌ Reject"}
          </button>
          <button onClick={handleApprove} disabled={approving || pin.length !== 4}
            style={{ flex: 2, padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", opacity: pin.length !== 4 ? 0.5 : 1 }}>
            {approving ? "Approving..." : "✅ Approve & Set PIN"}
          </button>
        </div>

        <button onClick={() => router.push("/")} style={{ width: "100%", marginTop: "0.75rem", padding: "0.75rem", background: "transparent", color: "#6b7280", border: "none", cursor: "pointer", fontSize: "0.85rem" }}>
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
