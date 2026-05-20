"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getPosesForPhase } from "@/lib/asanaLibrary";
import { getWarmupPoses, WARMUP_LIBRARY } from "@/lib/warmupLibrary";

const EXPERIENCE = ["beginner", "intermediate", "advanced"];
const STYLES = ["Hatha","Vinyasa","Yin","Restorative","Ashtanga","Power yoga"];
const GOALS = ["Flexibility And Strength","Physical And Mental Wellbeing","Recover From Health Issues","Weight Management"];
const CURRENT_HEALTH = ["Abdominal Disorders","Anxiety","Arthritis","Asthma","Back Pain","Cholesterol","Constipation","Depression","Diabetes Type 1","Diabetes Type 2","Dust Allergy","Epilepsy","Hair Loss","High Blood Pressure","Migraine","Heart Condition"];
const SURGERIES = ["Cesarean","Heart Surgery","Knee Surgery","Shoulder/Arm Surgery"];
const INJURY_OPTIONS = ["Cervical Spondylosis","Knee Cartilage Damage","Knee Injury","Slipped Disk","Tennis Elbow"];
const FAMILY_HISTORY = ["Blood Pressure","Diabetes","Heart Issues","Thyroid"];
const PRESETS = [30, 45, 60, 75, 90, 120];

const PHASE_COLORS = {
  "Warm-up":   { bg: "#FFF7ED", border: "#F59E0B", label: "#92400E" },
  "Asanas":    { bg: "#E1F5EE", border: "#1D9E75", label: "#0F6E56" },
  "Pranayama": { bg: "#EEF2FF", border: "#6366F1", label: "#3730A3" },
};
const PHASE_ICONS = { "Warm-up": "🔥", "Asanas": "🧘", "Pranayama": "🌬️" };

function calcSplit(total) {
  const t = parseInt(total) || 60;
  const warmup = Math.round(t * 0.25);
  const pranayama = Math.round(t * 0.17);
  return { warmup, asanas: t - warmup - pranayama, pranayama };
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.9rem", paddingBottom: "0.4rem", borderBottom: "1.5px solid var(--brand-light)" }}>
      {children}
    </div>
  );
}

function CheckboxGrid({ options, selected, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.5rem 1rem" }}>
      {options.map(opt => (
        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "13px", cursor: "pointer", color: "var(--text-muted)" }}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(opt)}
            style={{ accentColor: "var(--brand)", width: 14, height: 14, flexShrink: 0 }} />
          {opt}
        </label>
      ))}
    </div>
  );
}

function RadioRow({ label, options, selected, onChange }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "0.45rem" }}>{label}</div>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {options.map(opt => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.45rem", fontSize: "13px", cursor: "pointer", color: "var(--text-muted)" }}>
            <input type="radio" checked={selected === opt} onChange={() => onChange(opt)}
              style={{ accentColor: "var(--brand)", width: 14, height: 14 }} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", marginBottom: "0.75rem", overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", padding: "0.9rem 1.1rem", display: "flex", justifyContent: "space-between", alignItems: "center", background: open ? "var(--brand-light)" : "var(--surface)", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600, color: "var(--brand)" }}>
        {title}
        <span style={{ fontSize: "16px" }}>{open ? "∧" : "∨"}</span>
      </button>
      {open && <div style={{ padding: "1rem 1.1rem" }}>{children}</div>}
    </div>
  );
}

function PhaseSelector({ phase, clientInjuries, clientConditions, clientLevel, selectedPoses, onAdd, onRemove }) {
  const [chosen, setChosen] = useState("");
  const allContraindications = [...clientConditions, ...clientInjuries];
  const available = phase === "Warm-up" ? WARMUP_LIBRARY.filter(p => !p.contraindications.some(c => allContraindications.includes(c))) : getPosesForPhase(phase, clientInjuries, clientConditions, clientLevel);
  const colors = PHASE_COLORS[phase];
  const icon = PHASE_ICONS[phase];
  function handleAdd() {
    if (!chosen) return;
    const pose = available.find(p => p.name === chosen);
    if (pose && !selectedPoses.find(p => p.name === pose.name)) { onAdd(phase, pose); setChosen(""); }
  }
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: colors.bg, border: "1px solid " + colors.border, borderRadius: "8px", padding: "10px 14px", marginBottom: "10px" }}>
        <span style={{ fontSize: "18px" }}>{icon}</span>
        <div style={{ fontSize: "14px", fontWeight: 700, color: colors.label }}>{phase}</div>
        <div style={{ marginLeft: "auto", fontSize: "12px", color: colors.label }}>{selectedPoses.length} poses selected</div>
      </div>
      {selectedPoses.length > 0 && (
        <div style={{ marginBottom: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {selectedPoses.map((pose, i) => (
            <div key={pose.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px" }}>
              <div>
                <span style={{ fontWeight: 600 }}>{i + 1}. {pose.name}</span>
                <span style={{ color: "var(--text-muted)", marginLeft: "8px", fontStyle: "italic" }}>{pose.sanskrit}</span>
              </div>
              <button onClick={() => onRemove(phase, pose.name)} style={{ background: "var(--red-light)", color: "var(--red)", border: "none", borderRadius: "4px", padding: "2px 8px", cursor: "pointer", fontSize: "12px" }}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: "8px" }}>
        <select value={chosen} onChange={e => setChosen(e.target.value)}
          style={{ flex: 1, padding: "0.55rem 0.9rem", border: "1.5px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: "13px", color: "var(--text)", background: "var(--surface)", outline: "none" }}>
          <option value="">— Select a {phase} pose —</option>
          {available.filter(p => !selectedPoses.find(s => s.name === p.name)).map(p => (
            <option key={p.name} value={p.name}>{p.name} ({p.sanskrit})</option>
          ))}
        </select>
        <button onClick={handleAdd} disabled={!chosen}
          style={{ padding: "0.55rem 1rem", background: colors.label, color: "#fff", border: "none", borderRadius: "var(--radius-sm)", cursor: chosen ? "pointer" : "not-allowed", fontSize: "13px", fontWeight: 600, opacity: chosen ? 1 : 0.5 }}>
          + Add
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: "personal",   label: "Personal Info" },
  { id: "goals",      label: "Goals" },
  { id: "health",     label: "Health Profile" },
  { id: "lifestyle",  label: "Lifestyle & Habits" },
  { id: "sequences",  label: "Sequences" },
];

export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [client, setClient]       = useState(null);
  const [form, setForm]           = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState("");

  // Sequence state
  const [genMode, setGenMode]         = useState("ai");
  const [selectedStyle, setSelectedStyle] = useState("Hatha");
  const [duration, setDuration]       = useState(60);
  const [useCustom, setUseCustom]     = useState(false);
  const [customDur, setCustomDur]     = useState("");
  const [generating, setGenerating]   = useState(false);
  const [genError, setGenError]       = useState("");
  const [sequence, setSequence]       = useState(null);
  const [manualPoses, setManualPoses] = useState({ "Warm-up": [], "Asanas": [], "Pranayama": [] });
  const [manualSaving, setManualSaving] = useState(false);
  const [asanaCount, setAsanaCount] = useState(6);

  const activeDuration = useCustom ? (parseInt(customDur) || 60) : duration;
  const split = calcSplit(activeDuration);

  // Open correct tab from URL hash or query param
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    } else if (typeof window !== 'undefined' && window.location.hash === '#sequences') {
      setActiveTab('sequences');
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/clients/" + id).then(r => r.json()).then(data => {
      setClient(data);
      setForm({
        name: data.name, age: data.age, gender: data.gender || "",
        experience: data.experience,
        joinDate: data.joinDate ? new Date(data.joinDate).toISOString().split("T")[0] : "",
        injuries:      Array.isArray(data.injuries)      ? data.injuries      : [],
        conditions:    Array.isArray(data.conditions)    ? data.conditions    : [],
        goals:         Array.isArray(data.goals)         ? data.goals         : [],
        surgeries:     Array.isArray(data.surgeries)     ? data.surgeries     : [],
        familyHistory: Array.isArray(data.familyHistory) ? data.familyHistory : [],
        stressLevel: data.stressLevel || "", sleepPattern: data.sleepPattern || "",
        angerLevel: data.angerLevel || "", mealType: data.mealType || "",
        stayType: data.stayType || "", notes: data.notes || "",
      });
    });
  }, [id]);

  function toggleArr(field, val) {
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }));
  }

  async function handleSave() {
    if (!form.name || !form.age) return setError("Name and age are required.");
    setSaving(true); setError("");
    const res = await fetch("/api/clients/" + id, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    else { const d = await res.json(); setError(d.error || "Failed to update."); }
    setSaving(false);
  }

  function suggestStyle(client) {
    const injuries = Array.isArray(client.injuries) ? client.injuries : [];
    const conditions = Array.isArray(client.conditions) ? client.conditions : [];
    const goals = Array.isArray(client.goals) ? client.goals : [];
    if (goals.includes("Recover From Health Issues")) return { style: "Restorative", reason: "client is recovering from health issues" };
    if (injuries.length > 0 || conditions.length > 0) return { style: "Yin", reason: "gentle holds suit client limitations" };
    if (goals.includes("Weight Management")) return { style: "Power yoga", reason: "dynamic practice supports weight management" };
    if (client.experience === "advanced") return { style: "Vinyasa", reason: "flows suit advanced level" };
    if (client.experience === "intermediate") return { style: "Vinyasa", reason: "flows suit intermediate level" };
    return { style: "Hatha", reason: "balanced foundation for beginners" };
  }
  async function handleAIGenerate() {
    setGenError(""); setSequence(null); setGenerating(true);
    const res = await fetch("/api/generate-sequence", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, duration: activeDuration, asanaCount, session: { style: selectedStyle } }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGenError(data.error || "Failed to generate.");
    } else {
      const freshClient = await fetch("/api/clients/" + id).then(r => r.json());
      setClient(freshClient);
      setSequence(null);
      const { exportSequencePDF } = await import("@/lib/pdfExport");
      await exportSequencePDF(freshClient, { ...data.sequence, poses: data.sequence.poses }, asanaCount);
    }
    setGenerating(false);
  }

  function addPose(phase, pose) { setManualPoses(prev => ({ ...prev, [phase]: [...prev[phase], pose] })); }
  function removePose(phase, poseName) { setManualPoses(prev => ({ ...prev, [phase]: prev[phase].filter(p => p.name !== poseName) })); }

  async function handleDeleteSequence(seqId) {
    if (!confirm("Delete this sequence? This cannot be undone.")) return;
    await fetch("/api/sequences/" + seqId, { method: "DELETE" });
    fetch("/api/clients/" + id).then(r => r.json()).then(setClient);
  }

  async function handleSaveAndPrint() {
    const total = manualPoses["Warm-up"].length + manualPoses["Asanas"].length + manualPoses["Pranayama"].length;
    if (total === 0) return setGenError("Please select at least one pose.");
    setManualSaving(true); setGenError("");
    const warmupTime    = manualPoses["Warm-up"].length   > 0 ? Math.round(split.warmup    / manualPoses["Warm-up"].length)   : 0;
    const asanasTime    = manualPoses["Asanas"].length     > 0 ? Math.round(split.asanas    / manualPoses["Asanas"].length)     : 0;
    const pranayamaTime = manualPoses["Pranayama"].length  > 0 ? Math.round(split.pranayama / manualPoses["Pranayama"].length)  : 0;
    const sequenceJSON = {
      title: "Manual Hatha Sequence — " + client.name,
      totalPoses: total,
      cycleNumber: (client.sequences?.length || 0) + 1,
      safetyNotes: [],
      phases: [
        { phase: "Warm-up",   duration: split.warmup    + " min", poses: manualPoses["Warm-up"].map(p   => ({ name: p.name, sanskrit: p.sanskrit, duration: warmupTime    + " min", description: p.description, cues: p.cues || [], modification: null })) },
        { phase: "Asanas",    duration: split.asanas    + " min", poses: manualPoses["Asanas"].map(p    => ({ name: p.name, sanskrit: p.sanskrit, duration: asanasTime    + " min", description: p.description, cues: p.cues || [], modification: null })) },
        { phase: "Pranayama", duration: split.pranayama + " min", poses: manualPoses["Pranayama"].map(p => ({ name: p.name, sanskrit: p.sanskrit, duration: pranayamaTime + " min", description: p.description, cues: p.cues || [], modification: null })) },
      ],
    };
    const res = await fetch("/api/generate-sequence", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, duration: activeDuration, manual: true, sequenceJSON }),
    });
    const data = await res.json();
    if (!res.ok) {
      setGenError(data.error || "Failed to save.");
    } else {
      setManualPoses({ "Warm-up": [], "Asanas": [], "Pranayama": [] });
      setSequence(null);
      const freshClient = await fetch("/api/clients/" + id).then(r => r.json());
      setClient(freshClient);
      const { exportSequencePDF } = await import("@/lib/pdfExport");
      await exportSequencePDF(freshClient, { ...data.sequence, poses: data.sequence.poses }, asanaCount);
    }
    setManualSaving(false);
  }

  async function handleManualSave() {
    const total = manualPoses["Warm-up"].length + manualPoses["Asanas"].length + manualPoses["Pranayama"].length;
    if (total === 0) return setGenError("Please select at least one pose.");
    setManualSaving(true); setGenError("");
    // Fix: always fetch fresh client so cycle number is accurate
    const freshClient = await fetch("/api/clients/" + id).then(r => r.json());
    const freshCycleNumber = (freshClient.sequences?.length || 0) + 1;
    const warmupTime    = manualPoses["Warm-up"].length   > 0 ? Math.round(split.warmup    / manualPoses["Warm-up"].length)   : 0;
    const asanasTime    = manualPoses["Asanas"].length     > 0 ? Math.round(split.asanas    / manualPoses["Asanas"].length)     : 0;
    const pranayamaTime = manualPoses["Pranayama"].length  > 0 ? Math.round(split.pranayama / manualPoses["Pranayama"].length)  : 0;
    const sequenceJSON = {
      title: "Manual Hatha Sequence — " + client.name,
      totalPoses: total,
      cycleNumber: freshCycleNumber,
      safetyNotes: [],
      phases: [
        { phase: "Warm-up",   duration: split.warmup    + " min", poses: manualPoses["Warm-up"].map(p   => ({ name: p.name, sanskrit: p.sanskrit, duration: warmupTime    + " min", description: p.description, cues: p.cues || [], modification: null })) },
        { phase: "Asanas",    duration: split.asanas    + " min", poses: manualPoses["Asanas"].map(p    => ({ name: p.name, sanskrit: p.sanskrit, duration: asanasTime    + " min", description: p.description, cues: p.cues || [], modification: null })) },
        { phase: "Pranayama", duration: split.pranayama + " min", poses: manualPoses["Pranayama"].map(p => ({ name: p.name, sanskrit: p.sanskrit, duration: pranayamaTime + " min", description: p.description, cues: p.cues || [], modification: null })) },
      ],
    };
    const res = await fetch("/api/generate-sequence", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, duration: activeDuration, manual: true, sequenceJSON }),
    });
    const data = await res.json();
    if (!res.ok) setGenError(data.error || "Failed to save.");
    else {
      setManualPoses({ "Warm-up": [], "Asanas": [], "Pranayama": [] });
      setSequence(null);
      setGenMode("ai");
      setGenError("");
      fetch("/api/clients/" + id).then(r => r.json()).then(setClient);
    }
    setManualSaving(false);
  }

  if (!form) return <div className="loading"><div className="dots"><span /><span /><span /></div> Loading...</div>;

  const seqData = sequence?.poses ? (typeof sequence.poses === "string" ? JSON.parse(sequence.poses) : sequence.poses) : null;
  const clientInjuries   = Array.isArray(client.injuries)   ? client.injuries   : [];
  const clientConditions = Array.isArray(client.conditions) ? client.conditions : [];
  const seqCount = client._count?.sequences ?? 0;

  // Tab labels with count badge for sequences
  const tabLabel = (t) => t.id === "sequences" ? "Sequences (" + seqCount + ")" : t.label;

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 700 }}>
            {form.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="page-title" style={{ marginBottom: "2px" }}>{client.name}</h1>
            <p className="page-subtitle">Student profile · {seqCount} sequences · {form.experience}</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            👤 {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Profile"}
          </button>
          <button className="btn btn-outline" onClick={() => router.push("/clients")}>← Students</button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── 5 Tabs ── */}
      <div className="tabs" style={{ marginBottom: "1.5rem" }}>
        {TABS.map(t => (
          <button key={t.id} className={"tab" + (activeTab === t.id ? " active" : "")} onClick={() => setActiveTab(t.id)}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          Tab 1 — Personal Info
      ══════════════════════════════════════ */}
      {activeTab === "personal" && (
        <div className="card">
          <SectionTitle>Personal Information</SectionTitle>
          <div className="grid-2" style={{ gap: "1rem" }}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min="5" max="100" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="">Prefer not to say</option>
                <option>Female</option><option>Male</option><option>Non-binary</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Join Date</label>
              <input className="form-input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" onClick={() => setActiveTab("goals")}>Next: Goals →</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Tab 2 — Goals
      ══════════════════════════════════════ */}
      {activeTab === "goals" && (
        <div className="card">
          <SectionTitle>Yoga Goals</SectionTitle>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1.25rem" }}>Select all goals that apply to this student.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {GOALS.map(g => (
              <label key={g} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1rem", border: "1.5px solid " + (form.goals.includes(g) ? "var(--brand)" : "var(--border)"), borderRadius: "var(--radius-sm)", background: form.goals.includes(g) ? "var(--brand-light)" : "var(--surface)", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: form.goals.includes(g) ? "var(--brand)" : "var(--text-muted)", transition: "all 0.15s" }}>
                <input type="checkbox" checked={form.goals.includes(g)} onChange={() => toggleArr("goals", g)} style={{ accentColor: "var(--brand)", width: 15, height: 15 }} />
                {g}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-outline" onClick={() => setActiveTab("personal")}>← Personal Info</button>
            <button className="btn btn-primary" onClick={() => setActiveTab("health")}>Next: Health Profile →</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Tab 3 — Health Profile
      ══════════════════════════════════════ */}
      {activeTab === "health" && (
        <div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <SectionTitle>Health Profile</SectionTitle>
            <Accordion title="Current Health">
              <CheckboxGrid options={CURRENT_HEALTH} selected={form.conditions} onChange={v => toggleArr("conditions", v)} />
            </Accordion>
            <Accordion title="Medical History — Surgeries">
              <CheckboxGrid options={SURGERIES} selected={form.surgeries} onChange={v => toggleArr("surgeries", v)} />
            </Accordion>
            <Accordion title="Medical History — Injuries">
              <CheckboxGrid options={INJURY_OPTIONS} selected={form.injuries} onChange={v => toggleArr("injuries", v)} />
            </Accordion>
            <Accordion title="Family Health History">
              <CheckboxGrid options={FAMILY_HISTORY} selected={form.familyHistory} onChange={v => toggleArr("familyHistory", v)} />
            </Accordion>
            <Accordion title="Physical Metrics">
              <RadioRow label="Stress Level"  options={["Low","Medium","High"]}      selected={form.stressLevel}  onChange={v => setForm({ ...form, stressLevel: v })} />
              <RadioRow label="Sleep Pattern" options={["Normal","Disturbed Sleep"]} selected={form.sleepPattern} onChange={v => setForm({ ...form, sleepPattern: v })} />
              <RadioRow label="Anger Level"   options={["Normal","High"]}            selected={form.angerLevel}   onChange={v => setForm({ ...form, angerLevel: v })} />
            </Accordion>
          </div>
          <div className="card" style={{ marginBottom: "1rem" }}>
            <SectionTitle>Additional Notes</SectionTitle>
            <textarea className="form-textarea" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: "100%" }} placeholder="Any other relevant information..." />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-outline" onClick={() => setActiveTab("goals")}>← Goals</button>
            <button className="btn btn-primary" onClick={() => setActiveTab("lifestyle")}>Next: Lifestyle →</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Tab 4 — Lifestyle & Habits
      ══════════════════════════════════════ */}
      {activeTab === "lifestyle" && (
        <div className="card">
          <SectionTitle>Lifestyle & Habits</SectionTitle>
          <RadioRow label="Yoga Experience" options={["Beginner","Intermediate","Advanced"]}
            selected={form.experience.charAt(0).toUpperCase() + form.experience.slice(1)}
            onChange={v => setForm({ ...form, experience: v.toLowerCase() })} />
          <RadioRow label="Meal Type"  options={["Veg","Non Veg"]}          selected={form.mealType} onChange={v => setForm({ ...form, mealType: v })} />
          <RadioRow label="Stay Type"  options={["Family","Flat","Hostel"]} selected={form.stayType} onChange={v => setForm({ ...form, stayType: v })} />
          <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "space-between" }}>
            <button className="btn btn-outline" onClick={() => setActiveTab("health")}>← Health Profile</button>
            <button className="btn btn-primary" onClick={() => setActiveTab("sequences")}>Next: Sequences →</button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          Tab 5 — Sequences
      ══════════════════════════════════════ */}
      {activeTab === "sequences" && (
        <div>
          {/* Generator card */}
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--brand)" }}>Create Yoga Sequence</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                Hatha Yoga · Goal: {Array.isArray(client.goals) && client.goals.length > 0 ? client.goals.join(", ") : "General wellness"}
              </div>
            </div>

            {/* AI / Manual toggle */}
            <div style={{ display: "flex", background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "4px", marginBottom: "1.5rem", width: "fit-content" }}>
              {[{ id: "ai", label: "✨ AI Generated" }, { id: "manual", label: "🖐 Manual Selection" }].map(m => (
                <button key={m.id} onClick={() => { setGenMode(m.id); setSequence(null); setGenError(""); }}
                  style={{ padding: "0.5rem 1.25rem", fontSize: "13px", fontWeight: 600, borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", background: genMode === m.id ? "var(--brand)" : "transparent", color: genMode === m.id ? "#fff" : "var(--text-muted)", transition: "all 0.15s" }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Style picker */}
            {genMode === "ai" && (
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Yoga style</div>
              {(() => { const s = suggestStyle(client); return (<div style={{ fontSize: "11px", color: "var(--brand)", marginBottom: "0.5rem", background: "var(--brand-light)", padding: "4px 10px", borderRadius: "999px", display: "inline-block" }}>💡 Suggested: {s.style} — {s.reason}</div>); })()}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {STYLES.map(s => (<button key={s} type="button" onClick={() => setSelectedStyle(s)} style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "999px", cursor: "pointer", border: "1.5px solid " + (selectedStyle === s ? "var(--brand)" : "var(--border)"), background: selectedStyle === s ? "var(--brand-light)" : "var(--surface)", color: selectedStyle === s ? "var(--brand)" : "var(--text-muted)", fontWeight: selectedStyle === s ? 700 : 400 }}>{s}</button>))}
              </div>
            </div>
            )}
            {/* Duration picker */}
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text)", marginBottom: "0.5rem" }}>Session duration</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {PRESETS.map(d => (
                  <button key={d} type="button" onClick={() => { setUseCustom(false); setDuration(d); }}
                    style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "999px", cursor: "pointer", border: "1.5px solid " + (!useCustom && duration === d ? "var(--brand)" : "var(--border)"), background: !useCustom && duration === d ? "var(--brand-light)" : "var(--surface)", color: !useCustom && duration === d ? "var(--brand)" : "var(--text-muted)", fontWeight: !useCustom && duration === d ? 700 : 400 }}>
                    {d} min
                  </button>
                ))}
                <button type="button" onClick={() => setUseCustom(true)}
                  style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "999px", cursor: "pointer", border: "1.5px solid " + (useCustom ? "var(--brand)" : "var(--border)"), background: useCustom ? "var(--brand-light)" : "var(--surface)", color: useCustom ? "var(--brand)" : "var(--text-muted)", fontWeight: useCustom ? 700 : 400 }}>
                  Custom ✏️
                </button>
              </div>
              {useCustom && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "0.75rem" }}>
                  <input className="form-input" type="number" min="10" max="180" placeholder="e.g. 50" value={customDur} onChange={e => setCustomDur(e.target.value)} style={{ maxWidth: "140px" }} />
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>minutes</span>
                </div>
              )}
            </div>

            {/* Split preview */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
              {[
                { phase: "Warm-up",   mins: split.warmup,    icon: "🔥", bg: "#FFF7ED", border: "#F59E0B", text: "#92400E", sub: "Joint mobilisation" },
                { phase: "Asanas",    mins: split.asanas,    icon: "🧘", bg: "#E1F5EE", border: "#1D9E75", text: "#0F6E56", sub: "Main postures" },
                { phase: "Pranayama", mins: split.pranayama, icon: "🌬️", bg: "#EEF2FF", border: "#6366F1", text: "#3730A3", sub: "Breathing & Savasana" },
              ].map(p => (
                <div key={p.phase} style={{ background: p.bg, border: "1px solid " + p.border, borderRadius: "8px", padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px" }}>{p.icon}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: p.text, marginTop: "3px" }}>{p.phase}</div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: p.text, margin: "2px 0" }}>{p.mins} min</div>
                  <div style={{ fontSize: "10px", color: p.text, opacity: 0.8 }}>{p.sub}</div>
                </div>
              ))}
            </div>

            {genError && <div className="alert alert-error">{genError}</div>}

            {/* Asana count picker — AI mode only */}
            {genMode === "ai" && <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", background: "var(--bg)", borderRadius: "8px", padding: "8px 12px", border: "1px solid var(--border)", width: "fit-content" }}>
              <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>Asanas to print:</span>
              <button onClick={() => setAsanaCount(c => Math.max(1, c - 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "16px", fontWeight: 700 }}>−</button>
              <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--brand)", minWidth: "24px", textAlign: "center" }}>{asanaCount}</span>
              <button onClick={() => setAsanaCount(c => Math.min(10, c + 1))} style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontSize: "16px", fontWeight: 700 }}>+</button>
            </div>}

            {/* AI mode button */}
            {genMode === "ai" && (
              <button className="btn btn-primary btn-lg" onClick={handleAIGenerate} disabled={generating}>
                {generating ? "Generating & Saving..." : "✨ AI Generate & Print " + activeDuration + "-min Session"}
              </button>
            )}

            {/* Manual mode */}
            {genMode === "manual" && (
              <div>
                <div style={{ padding: "0.75rem 1rem", background: "var(--saffron-light)", borderLeft: "3px solid var(--saffron)", borderRadius: "0 var(--radius-sm) var(--radius-sm) 0", fontSize: "12px", color: "var(--saffron-dark)", marginBottom: "1.25rem" }}>
                  ⚠ Poses unsafe for this student's conditions are automatically hidden.
                </div>
                {["Warm-up", "Asanas", "Pranayama"].map(phase => (
                  <PhaseSelector key={phase} phase={phase}
                    clientInjuries={clientInjuries} clientConditions={clientConditions} clientLevel={client.experience}
                    selectedPoses={manualPoses[phase]} onAdd={addPose} onRemove={removePose} />
                ))}
                <button className="btn btn-primary btn-lg" onClick={handleSaveAndPrint} disabled={manualSaving}
                  style={{ background: "#0F6E56" }}>
                  {manualSaving ? "Saving..." : "💾🖨️ Save & Print"}
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {generating && (
            <div className="loading">
              <div className="dots"><span /><span /><span /></div>
              Designing {activeDuration}-min Hatha session for {client.name}...
            </div>
          )}

          {/* Generated result */}
          {sequence && seqData && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 700 }}>{seqData.title}</h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
                    Cycle {seqData.cycleNumber} · {activeDuration} min · Hatha · {client.name}
                  </p>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setSequence(null)}>✕ Clear</button>
              </div>
              {seqData.safetyNotes?.length > 0 && (
                <div className="safety-box">
                  <div className="safety-box-title">⚠ Safety notes for {client.name}</div>
                  <ul>{seqData.safetyNotes.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </div>
              )}
              {seqData.phases?.map(phase => {
                const colors = PHASE_COLORS[phase.phase] || PHASE_COLORS["Asanas"];
                const icon   = PHASE_ICONS[phase.phase]  || "🧘";
                return (
                  <div key={phase.phase} style={{ marginBottom: "1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", background: colors.bg, border: "1px solid " + colors.border, borderRadius: "10px", padding: "12px 16px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "20px" }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: colors.label }}>{phase.phase}</div>
                        <div style={{ fontSize: "12px", color: colors.label }}>{phase.duration}</div>
                      </div>
                      <div style={{ marginLeft: "auto", fontSize: "12px", color: colors.label }}>{phase.poses.length} poses</div>
                    </div>
                    {phase.poses.map((pose, i) => (
                      <div key={i} className="pose-card" style={{ borderLeft: "3px solid " + colors.border }}>
                        <div className="pose-header">
                          <div>
                            <span className="pose-name">{i + 1}. {pose.name}</span>
                            <div className="pose-sanskrit">{pose.sanskrit}</div>
                          </div>
                          <span className="pose-duration-badge">{pose.duration}</span>
                        </div>
                        <div className="pose-desc">{pose.description}</div>
                        {(Array.isArray(pose.cues) ? pose.cues.length > 0 : !!pose.cues) && (
                          <div className="pose-cues">{(Array.isArray(pose.cues) ? pose.cues : [pose.cues]).map((cue, j) => <span key={j} className="tag tag-green">{cue}</span>)}</div>
                        )}
                        {pose.modification && <div className="pose-mod">{pose.modification}</div>}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Past sequences */}
          {!sequence && (
            <div className="card">
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Past Sequences</div>
              {!client.sequences || client.sequences.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🧘</div>
                  <p>No sequences yet. Create the first one above!</p>
                </div>
              ) : (
                client.sequences.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.9rem 0", borderBottom: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>{s.title}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                        {s.duration} min · Hatha · <span style={{ color: "var(--saffron-dark)", fontWeight: 600 }}>Cycle {s.cycleNumber}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                    <Link href={"/sequences/" + s.id} className="btn btn-outline btn-sm">View</Link>
                    <button onClick={() => handleDeleteSequence(s.id)} className="btn btn-sm" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: "var(--radius-sm)", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>🗑 Delete</button>
                  </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
