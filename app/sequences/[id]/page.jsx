"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { exportSequencePDF } from "@/lib/pdfExport";
import { getPoseImage } from "@/lib/poseImages";
import { getPranayamaRecommendations } from "@/lib/pranayamaRules";

const STYLES = ["Hatha", "Vinyasa", "Yin", "Restorative", "Ashtanga", "Power yoga"];
const GOALS = ["Flexibility", "Stress relief", "Strength", "Balance", "Back pain relief", "Core strength", "Hip opening", "Breathwork", "General wellness"];
const FOCUS = ["Full body", "Upper body", "Lower body", "Core", "Hips", "Back", "Shoulders"];

const PHASE_COLORS = {
  "Warm-up":   { bg: "#FFF7ED", border: "#F59E0B", label: "#92400E" },
  "Asanas":    { bg: "#E1F5EE", border: "#1D9E75", label: "#0F6E56" },
  "Pranayama": { bg: "#EEF2FF", border: "#6366F1", label: "#3730A3" },
};

function AsanaPlanView({ seqData, sequence, onEdit, onPrint, asanaCount, setAsanaCount }) {
  const allPoses = seqData?.phases?.flatMap(p => p.poses) || [];
  const warmupPhase = seqData?.phases?.find(p => p.phase === "Warm-up");
  const asanasPhase = seqData?.phases?.find(p => p.phase === "Asanas");
  const pranayamaPhase = seqData?.phases?.find(p => p.phase === "Pranayama");

  const startDate = new Date(sequence.createdAt);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 9);

  function formatDate(d) {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  return (
    <div>
      {/* Header card */}
      <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--green)", marginBottom: "4px" }}>Asana Plan</div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>{seqData?.title}</h2>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              For <strong>{sequence.client?.name}</strong> · {formatDate(startDate)} — {formatDate(endDate)} · {sequence.duration} min · {sequence.style}
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg)", borderRadius: "8px", padding: "6px 12px", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 500 }}>Asanas:</span>
              <button onClick={() => setAsanaCount(c => Math.max(1, c - 1))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand)", minWidth: "20px", textAlign: "center" }}>{asanaCount}</span>
              <button onClick={() => setAsanaCount(c => Math.min(10, c + 1))} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "14px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            <button className="btn btn-outline btn-sm" onClick={onEdit}>✏️ Edit</button>
            <button className="btn btn-outline btn-sm" onClick={onPrint}>🖨️ Print</button>
          </div>
        </div>

        {/* 10-day strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "4px", marginTop: "1rem" }}>
          {Array.from({ length: 10 }, (_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);
            const today = new Date();
            const isToday = d.toDateString() === today.toDateString();
            const isPast = d < today && !isToday;
            return (
              <div key={i} style={{ textAlign: "center", padding: "6px 4px", borderRadius: "8px", background: isToday ? "var(--green)" : isPast ? "#F3F4F6" : "var(--green-light)", border: `1px solid ${isToday ? "var(--green-dark)" : "var(--border)"}` }}>
                <div style={{ fontSize: "10px", color: isToday ? "white" : "var(--text-muted)", fontWeight: 600 }}>Day {i + 1}</div>
                <div style={{ fontSize: "10px", color: isToday ? "white" : "var(--text-muted)" }}>
                  {d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warmup note */}
      {warmupPhase && warmupPhase.poses.length > 0 && (
        <div style={{ background: "#FFF7ED", border: "1px solid #F59E0B", borderRadius: "10px", padding: "12px 16px", marginBottom: "1rem" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>
            🔥 Warm up to be included for first {warmupPhase.duration} —
          </div>
          <div style={{ fontSize: "13px", color: "#B45309" }}>
            {warmupPhase.poses.map(p => p.name).join(", ")}
          </div>
        </div>
      )}

      {/* Asana card grid */}
      {asanasPhase && asanasPhase.poses.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--green)", marginBottom: "0.75rem" }}>
            🧘 Asanas — {asanasPhase.duration}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {asanasPhase.poses.map((pose, i) => {
              const cleanName = (pose.sanskrit || pose.name).replace(/\s*\(.*?\)/g, '').replace(/\s*(modified|variation|with\s+.*|and\s+.*)/gi, '').trim();
              const imgSrc = getPoseImage(cleanName, "Asanas");
              return (
                <div key={i} style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ position: "relative" }}>
                    {imgSrc
                      ? <img src={imgSrc} alt={pose.name} style={{ width: "100%", height: "180px", objectFit: "contain", display: "block", background: "#f9fafb" }} onError={e => { e.target.style.display = "none"; }} />
                      : <div style={{ width: "100%", height: "180px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "13px" }}>🧘 No image yet</div>
                    }
                    <div style={{ position: "absolute", top: "10px", left: "10px", background: "var(--green)", color: "white", width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700 }}>
                      {i + 1}
                    </div>
                  </div>
                  <div style={{ padding: "12px", textAlign: "center" }}>
                    {pose.sanskrit && <div style={{ fontSize: "13px", fontWeight: 700, color: "#C0392B", marginBottom: "2px" }}>{pose.sanskrit}</div>}
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic", marginBottom: "6px" }}>{pose.name}</div>

                    {pose.modification && (
                      <div style={{ fontSize: "11px", color: "#6366F1", marginTop: "4px", padding: "4px 8px", background: "#EEF2FF", borderRadius: "6px" }}>
                        ⚡ {pose.modification}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pranayama section — condition-aware recommendations */}
      {(() => {
        const clientConditions = Array.isArray(sequence.client?.conditions)
          ? sequence.client.conditions
          : (sequence.client?.conditions || "").split(",").filter(Boolean);
        const clientInjuries = Array.isArray(sequence.client?.injuries)
          ? sequence.client.injuries
          : (sequence.client?.injuries || "").split(",").filter(Boolean);
        const { recommended, notRecommended } = getPranayamaRecommendations(clientConditions, clientInjuries);
        return (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              {/* Recommended */}
              <div style={{ background: "#E1F5EE", border: "1px solid #1D9E75", borderRadius: "10px", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#0F6E56", marginBottom: "10px" }}>🌬️ Recommended Pranayamas</div>
                {recommended.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#0F6E56" }}>Consult instructor for safe options</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {recommended.map((p, i) => (
                      <div key={i} style={{ background: "white", borderRadius: "8px", padding: "8px 10px", border: "1px solid #9FE1CB" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#0F6E56" }}>{i + 1}. {p.name}</span>
                          <span style={{ fontSize: "10px", color: "#1D9E75", fontStyle: "italic" }}>{p.sanskrit}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#0F6E56", marginBottom: "2px" }}>{p.description}</div>
                        <div style={{ fontSize: "11px", color: "#1D9E75", fontWeight: 600 }}>✅ {p.reason}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Not Recommended */}
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: "10px", padding: "1rem 1.25rem" }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", marginBottom: "10px" }}>⚠️ Not Recommended for This Student</div>
                {notRecommended.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "#DC2626" }}>No restrictions for this student</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {notRecommended.map((p, i) => (
                      <div key={i} style={{ background: "white", borderRadius: "8px", padding: "8px 10px", border: "1px solid #FCA5A5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626" }}>❌ {p.name}</span>
                          <span style={{ fontSize: "10px", color: "#EF4444", fontStyle: "italic" }}>{p.sanskrit}</span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#B91C1C", marginBottom: "3px" }}>
                          ⚡ {p.contraindicationReason}
                        </div>
                        <div style={{ fontSize: "10px", color: "#EF4444", fontWeight: 600 }}>
                          Blocked by: {p.blockedBy.join(", ")}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function EditView({ seqData, setSeqData, sequence, setSequence, saving, saved, onSave, regenerating, showRegenPanel, setShowRegenPanel, regenSession, setRegenSession, onRegenerate }) {
  function updatePose(phaseIdx, poseIdx, field, value) {
    const updated = { ...seqData };
    updated.phases[phaseIdx].poses[poseIdx][field] = value;
    setSeqData({ ...updated });
  }

  function deletePose(phaseIdx, poseIdx) {
    const updated = { ...seqData };
    updated.phases[phaseIdx].poses.splice(poseIdx, 1);
    updated.totalPoses = updated.phases.reduce((a, p) => a + p.poses.length, 0);
    setSeqData({ ...updated });
  }

  return (
    <div>

      {regenerating && (
        <div className="loading"><div className="dots"><span /><span /><span /></div> AI is generating a new sequence...</div>
      )}

      {!regenerating && (
        <>
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>Session details</h2>
            <div className="grid-2" style={{ gap: "1rem" }}>
              <div className="form-group col-span-2">
                <label className="form-label">Title</label>
                <input className="form-input" value={seqData.title || ""} onChange={e => setSeqData({ ...seqData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Style</label>
                <select className="form-select" value={sequence.style} onChange={e => setSequence({ ...sequence, style: e.target.value })}>
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Goal</label>
                <select className="form-select" value={sequence.goal} onChange={e => setSequence({ ...sequence, goal: e.target.value })}>
                  {GOALS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>

          {seqData.phases?.map((phase, phaseIdx) => (
            <div key={phaseIdx} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.75rem" }}>
                <span className="phase-label">{phase.phase}</span>
                <span className="phase-meta" style={{ marginLeft: "8px", fontSize: "12px", color: "var(--text-muted)" }}>{phase.duration}</span>
              </div>
              {phase.poses.map((pose, poseIdx) => (
                <div key={poseIdx} className="pose-card" style={{ marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div style={{ flex: 1, display: "flex", gap: "8px" }}>
                      <input className="form-input" style={{ fontWeight: 600 }} value={pose.name} onChange={e => updatePose(phaseIdx, poseIdx, "name", e.target.value)} placeholder="Pose name" />
                      <input className="form-input" value={pose.sanskrit || ""} onChange={e => updatePose(phaseIdx, poseIdx, "sanskrit", e.target.value)} placeholder="Sanskrit" />
                      <input className="form-input" style={{ width: "130px" }} value={pose.duration || ""} onChange={e => updatePose(phaseIdx, poseIdx, "duration", e.target.value)} placeholder="Duration" />
                    </div>
                    <button onClick={() => deletePose(phaseIdx, poseIdx)} style={{ marginLeft: "8px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", padding: "6px 10px", cursor: "pointer" }}>🗑</button>
                  </div>
                  <textarea className="form-input" rows={2} value={pose.description || ""} onChange={e => updatePose(phaseIdx, poseIdx, "description", e.target.value)} placeholder="Description" style={{ width: "100%", marginBottom: "6px" }} />
                  <input className="form-input" value={pose.modification || ""} onChange={e => updatePose(phaseIdx, poseIdx, "modification", e.target.value)} placeholder="Modification (optional)" style={{ width: "100%" }} />
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default function SequenceDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState("view");
  const [sequence, setSequence] = useState(null);
  const [seqData, setSeqData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [asanaCount, setAsanaCount] = useState(6);
  const [showRegenPanel, setShowRegenPanel] = useState(false);
  const [regenSession, setRegenSession] = useState(null);

  useEffect(() => {
    fetch(`/api/sequences/${id}`).then(r => r.json()).then(data => {
      setSequence(data);
      setRegenSession({ duration: data.duration, style: data.style, goal: data.goal, energy: data.energy || "moderate", focusArea: "Full body" });
      try { setSeqData(JSON.parse(data.poses)); } catch { setSeqData({}); }
    });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/sequences/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sequence, poses: JSON.stringify(seqData) }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setTab("view");
  }

  async function handleRegenerate() {
    setRegenerating(true); setShowRegenPanel(false);
    const res = await fetch("/api/generate-sequence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: sequence.clientId, session: regenSession }),
    });
    const data = await res.json();
    if (res.ok) {
      const newPoses = typeof data.sequence.poses === "string" ? data.sequence.poses : JSON.stringify(data.sequence.poses);
      await fetch(`/api/sequences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...sequence, title: data.sequence.title, duration: regenSession.duration, style: regenSession.style, goal: regenSession.goal, energy: regenSession.energy, poses: newPoses }),
      });
      setSequence(prev => ({ ...prev, ...regenSession, title: data.sequence.title }));
      try { setSeqData(typeof data.sequence.poses === "string" ? JSON.parse(data.sequence.poses) : data.sequence.poses); } catch { setSeqData({}); }
      setTab("view");
    }
    setRegenerating(false);
  }

  if (!sequence || !seqData) return (
    <div className="loading"><div className="dots"><span /><span /><span /></div> Loading...</div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 className="page-title">{seqData.title || sequence.title}</h1>
          <p className="page-subtitle">For {sequence.client?.name} · Cycle {sequence.cycleNumber || 1}</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {tab === "edit" && (
            <>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : saved ? "✅ Saved!" : "Save changes"}
              </button>
            </>
          )}

          <button className="btn btn-outline" onClick={() => router.push('/clients/' + sequence.clientId + '?tab=sequences')}>← Back</button>
        </div>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", marginBottom: "1.5rem", border: "1px solid var(--border)", borderRadius: "10px", overflow: "hidden", width: "fit-content" }}>
        {[{ key: "view", label: "📋 Asana Plan" }, { key: "edit", label: "✏️ Edit" }].map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            style={{ padding: "10px 24px", fontSize: "14px", fontWeight: 600, cursor: "pointer", border: "none", outline: "none", background: tab === t.key ? "var(--green)" : "var(--white)", color: tab === t.key ? "white" : "var(--text-muted)", transition: "all 0.15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "view" && (
        <AsanaPlanView seqData={seqData} sequence={sequence} asanaCount={asanaCount} setAsanaCount={setAsanaCount} onEdit={() => setTab("edit")} onPrint={() => exportSequencePDF(sequence.client, { ...sequence, poses: seqData }, asanaCount)} />
      )}
      {tab === "edit" && (
        <EditView seqData={seqData} setSeqData={setSeqData} sequence={sequence} setSequence={setSequence} saving={saving} saved={saved} onSave={handleSave} regenerating={regenerating} showRegenPanel={showRegenPanel} setShowRegenPanel={setShowRegenPanel} regenSession={regenSession} setRegenSession={setRegenSession} onRegenerate={handleRegenerate} />
      )}
    </div>
  );
}
