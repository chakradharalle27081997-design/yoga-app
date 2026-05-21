"use client";
import { getCycleStatus } from "@/lib/cycleStatus";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const EXPERIENCE = ["beginner", "intermediate", "advanced"];
const GOALS = [
  "Flexibility And Strength",
  "Physical And Mental Wellbeing",
  "Recover From Health Issues",
  "Weight Management",
];
const CURRENT_HEALTH = [
  "Abdominal Disorders","Anxiety","Arthritis","Asthma","Back Pain",
  "Cholesterol","Constipation","Depression","Diabetes Type 1","Diabetes Type 2",
  "Dust Allergy","Epilepsy","Hair Loss","High Blood Pressure","Migraine","Heart Condition",
];
const SURGERIES = ["Cesarean","Heart Surgery","Knee Surgery","Shoulder/Arm Surgery"];
const INJURY_OPTIONS = [
  "Cervical Spondylosis","Knee Cartilage Damage","Knee Injury","Slipped Disk","Tennis Elbow",
];
const FAMILY_HISTORY = ["Blood Pressure","Diabetes","Heart Issues","Thyroid"];

const EMPTY_FORM = {
  name: "", age: "", gender: "", experience: "beginner",
  joinDate: new Date().toISOString().split("T")[0],
  goals: [], conditions: [], surgeries: [], injuries: [], familyHistory: [],
  stressLevel: "", sleepPattern: "", angerLevel: "",
  mealType: "", stayType: "", notes: "", phone: "", pin: "",
};

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

const FORM_TABS = [
  { id: "personal",  label: "1. Personal Info" },
  { id: "goals",     label: "2. Goals" },
  { id: "health",    label: "3. Health Profile" },
  { id: "lifestyle", label: "4. Lifestyle" },
];

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}



// Sort arrow component
function SortArrow({ col, sortCol, sortDir }) {
  return (
    <span style={{ marginLeft: "4px", opacity: sortCol === col ? 1 : 0.3, fontSize: "10px" }}>
      {sortCol === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );
}

// Avatar with initials
function Avatar({ name, size = 34 }) {
  const colors = ["#2D5A1B","#C17F3A","#1D9E75","#6366F1","#E85D04","#7B2D8B"];
  const idx = name.charCodeAt(0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[idx], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.38 + "px", flexShrink: 0 }}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formTab, setFormTab]   = useState("personal");
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [form, setForm]         = useState(EMPTY_FORM);
  const [sortCol, setSortCol]   = useState("name");
  const [sortDir, setSortDir]   = useState("asc");

  // Pagination state
  const [page, setPage]         = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchClients();
    if (window.location.search.includes("action=add")) setTimeout(() => openForm(), 100);
  }, []);


  async function fetchClients() {
    setLoading(true);
    const res  = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
    setLoading(false);
  }

  function toggleArr(field, val) {
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }));
  }

  function openForm() {
    setForm(EMPTY_FORM); setFormTab("personal"); setError(""); setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.age) { setFormTab("personal"); return setError("Name and age are required."); }
    setSaving(true); setError("");
    const res = await fetch("/api/clients", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    if (res.ok) { setShowForm(false); setForm(EMPTY_FORM); fetchClients(); }
    else { const d = await res.json(); setError(d.error || "Failed to save."); }
    setSaving(false);
  }

  async function deleteClient(id) {
    if (!confirm("Delete this student and all their sequences?")) return;
    await fetch("/api/clients/" + id, { method: "DELETE" });
    fetchClients();
  }

  // Sorting logic
  function handleSort(col) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  }

  function getSortValue(c, col) {
    if (col === "name") return c.name.toLowerCase();
    if (col === "joinDate") return new Date(c.joinDate || c.createdAt).getTime();
    if (col === "planEnd") {
      const cycle = getCycleStatus(c);
      return cycle.endDate ? new Date(cycle.endDate).getTime() : 0;
    }
    return 0;
  }

  const sorted = [...clients].sort((a, b) => {
    const av = getSortValue(a, sortCol);
    const bv = getSortValue(b, sortCol);
    return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const paginated  = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Stats
  const activeCount  = clients.filter(c => getCycleStatus(c).status === "active").length;
  const endedCount   = clients.filter(c => getCycleStatus(c).status === "ended").length;

  const thStyle = (col) => ({
    cursor: "pointer", userSelect: "none", whiteSpace: "nowrap",
    color: sortCol === col ? "var(--brand)" : undefined,
  });

  return (
    <div>
      {/* Page header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">My Students</h1>
          <p className="page-subtitle">{clients.length} student{clients.length !== 1 ? "s" : ""} registered</p>
        </div>
      </div>

      {/* ── Add Student Form ── */}
      {showForm && (
        <div className="card" style={{ marginBottom: "2rem", border: "2px solid var(--saffron)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--brand)" }}>New Student Registration</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>✕ Cancel</button>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--border)", marginBottom: "1.5rem", overflowX: "auto" }}>
            {FORM_TABS.map(t => (
              <button key={t.id} type="button" onClick={() => setFormTab(t.id)} style={{
                padding: "0.55rem 1.1rem", fontSize: "13px", fontWeight: 500,
                color: formTab === t.id ? "var(--brand)" : "var(--text-muted)",
                borderBottom: formTab === t.id ? "2px solid var(--brand)" : "2px solid transparent",
                marginBottom: "-2px", background: "none", border: "none",
                borderTop: "none", borderLeft: "none", borderRight: "none",
                cursor: "pointer", whiteSpace: "nowrap",
              }}>{t.label}</button>
            ))}
          </div>
          <form onSubmit={handleSubmit}>
            {formTab === "personal" && (
              <div>
                <SectionTitle>Personal Information</SectionTitle>
                <div className="grid-2" style={{ gap: "1rem", marginBottom: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Full name *</label>
                    <input className="form-input" placeholder="Student name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age *</label>
                    <input className="form-input" type="number" min="5" max="100" placeholder="Age" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-select" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                      <option value="">Prefer not to say</option>
                      <option>Female</option><option>Male</option><option>Non-binary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select className="form-select" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                      {EXPERIENCE.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Join Date</label>
                    <input className="form-input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "1rem" }}>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" type="tel" placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-primary" onClick={() => setFormTab("goals")}>Next: Goals →</button>
                </div>
              </div>
            )}
            {formTab === "goals" && (
              <div>
                <SectionTitle>Yoga Goals</SectionTitle>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "1rem" }}>Select all goals that apply.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  {GOALS.map(g => (
                    <label key={g} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", border: "1.5px solid " + (form.goals.includes(g) ? "var(--brand)" : "var(--border)"), borderRadius: "var(--radius-sm)", background: form.goals.includes(g) ? "var(--brand-light)" : "var(--surface)", cursor: "pointer", fontSize: "13px", fontWeight: 500, color: form.goals.includes(g) ? "var(--brand)" : "var(--text-muted)" }}>
                      <input type="checkbox" checked={form.goals.includes(g)} onChange={() => toggleArr("goals", g)} style={{ accentColor: "var(--brand)", width: 15, height: 15 }} />
                      {g}
                    </label>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setFormTab("personal")}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setFormTab("health")}>Next: Health Profile →</button>
                </div>
              </div>
            )}
            {formTab === "health" && (
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <SectionTitle>Current Health Conditions</SectionTitle>
                  <CheckboxGrid options={CURRENT_HEALTH} selected={form.conditions} onChange={v => toggleArr("conditions", v)} />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <SectionTitle>Medical History — Surgeries</SectionTitle>
                  <CheckboxGrid options={SURGERIES} selected={form.surgeries} onChange={v => toggleArr("surgeries", v)} />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <SectionTitle>Medical History — Injuries</SectionTitle>
                  <CheckboxGrid options={INJURY_OPTIONS} selected={form.injuries} onChange={v => toggleArr("injuries", v)} />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <SectionTitle>Family Health History</SectionTitle>
                  <CheckboxGrid options={FAMILY_HISTORY} selected={form.familyHistory} onChange={v => toggleArr("familyHistory", v)} />
                </div>
                <div style={{ background: "var(--bg)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
                  <SectionTitle>Physical Metrics</SectionTitle>
                  <RadioRow label="Stress Level" options={["Low","Medium","High"]} selected={form.stressLevel} onChange={v => setForm({ ...form, stressLevel: v })} />
                  <RadioRow label="Sleep Pattern" options={["Normal","Disturbed Sleep"]} selected={form.sleepPattern} onChange={v => setForm({ ...form, sleepPattern: v })} />
                  <RadioRow label="Anger Level" options={["Normal","High"]} selected={form.angerLevel} onChange={v => setForm({ ...form, angerLevel: v })} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setFormTab("goals")}>← Back</button>
                  <button type="button" className="btn btn-primary" onClick={() => setFormTab("lifestyle")}>Next: Lifestyle →</button>
                </div>
              </div>
            )}
            {formTab === "lifestyle" && (
              <div>
                <SectionTitle>Lifestyle & Habits</SectionTitle>
                <RadioRow label="Meal Type" options={["Veg","Non Veg"]} selected={form.mealType} onChange={v => setForm({ ...form, mealType: v })} />
                <RadioRow label="Stay Type" options={["Family","Flat","Hostel"]} selected={form.stayType} onChange={v => setForm({ ...form, stayType: v })} />
                <div style={{ marginTop: "1rem", marginBottom: "1.25rem" }}>
                  <SectionTitle>Additional Notes</SectionTitle>
                  <textarea className="form-textarea" rows={3} placeholder="Any other relevant information..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ width: "100%" }} />
                </div>
                <div style={{ background: "var(--brand-light)", border: "1px solid var(--brand)", borderRadius: "var(--radius-sm)", padding: "1rem 1.25rem", marginBottom: "1.25rem" }}>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--brand)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Registration Summary</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem 1.5rem", fontSize: "13px" }}>
                    <div><span style={{ color: "var(--text-muted)" }}>Name: </span>{form.name || "—"}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Age: </span>{form.age || "—"}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Experience: </span>{form.experience}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Join Date: </span>{form.joinDate}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Goals: </span>{form.goals.length > 0 ? form.goals.join(", ") : "None"}</div>
                    <div><span style={{ color: "var(--text-muted)" }}>Conditions: </span>{form.conditions.length > 0 ? form.conditions.join(", ") : "None"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <button type="button" className="btn btn-outline" onClick={() => setFormTab("health")}>← Back</button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                    {saving ? "Saving..." : "✅ Register Student"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ── Two-column layout: Table + Stat card ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "1.25rem", alignItems: "start" }}>

        {/* ── Students Table ── */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 700 }}>My Yoga Students</h2>
            <button className="btn btn-primary" onClick={openForm} style={{ background: "var(--brand)", fontWeight: 600 }}>
              Add Student
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="dots"><span /><span /><span /></div>Loading students...</div>
          ) : clients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</div>
              <p style={{ marginBottom: "1rem" }}>No students enrolled yet.</p>
              <button className="btn btn-primary" onClick={openForm}>+ Add Your First Student</button>
            </div>
          ) : (
            <>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>SI No.</th>
                      <th style={thStyle("name")} onClick={() => handleSort("name")}>
                        Name <SortArrow col="name" sortCol={sortCol} sortDir={sortDir} />
                      </th>
                      <th style={thStyle("joinDate")} onClick={() => handleSort("joinDate")}>
                        Date of Joining <SortArrow col="joinDate" sortCol={sortCol} sortDir={sortDir} />
                      </th>
                      <th>Progress</th>
                      <th>Asana Plan Start</th>
                      <th style={thStyle("planEnd")} onClick={() => handleSort("planEnd")}>
                        Asana Plan End <SortArrow col="planEnd" sortCol={sortCol} sortDir={sortDir} />
                      </th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((c, idx) => {
                      const cycle = getCycleStatus(c);
                      const globalIdx = (page - 1) * rowsPerPage + idx + 1;
                      return (
                        <tr key={c.id} style={{ background: cycle.status === "ended" ? "#FFFBEB" : "transparent" }}>
                          <td style={{ color: "var(--text-muted)", fontWeight: 500 }}>{globalIdx}.</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                              <Avatar name={c.name} size={34} />
                              <Link href={"/clients/" + c.id} style={{ fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>
                                {c.name}
                              </Link>
                            </div>
                          </td>
                          <td style={{ fontSize: "13px" }}>{formatDate(c.joinDate || c.createdAt)}</td>
                          <td>
                            {cycle.status === "none" ? (
                              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>—</span>
                            ) : cycle.status === "active" ? (
                              <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#E1F5EE", color: "#0F6E56" }}>🟢 {cycle.daysLeft}d left</span>
                            ) : (
                              <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "999px", background: "#FEE2E2", color: "#DC2626" }}>🔴 Ended</span>
                            )}
                          </td>
                          <td style={{ fontSize: "13px" }}>{cycle.status === "none" ? "—" : formatDate(cycle.startDate)}</td>
                          <td style={{ fontSize: "13px" }}>{cycle.status === "none" ? "—" : formatDate(cycle.endDate)}</td>
                          <td>
                            <Link href={"/clients/" + c.id} style={{ color: "var(--text-muted)", fontSize: "18px", textDecoration: "none" }} title="Edit">✏️</Link>
                            <button onClick={() => deleteClient(c.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", marginLeft: "8px" }} title="Delete">🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Pagination bar ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", fontSize: "13px", color: "var(--text-muted)", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>Showing {Math.min((page - 1) * rowsPerPage + 1, clients.length)} – {Math.min(page * rowsPerPage, clients.length)} of {clients.length}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {/* Prev */}
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ width: 28, height: 28, borderRadius: "6px", border: "1px solid var(--border)", background: page === 1 ? "var(--bg)" : "var(--surface)", cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "var(--text-muted)" : "var(--text)", fontWeight: 700, fontSize: "14px" }}>
                    ‹
                  </button>
                  {/* Page indicator */}
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span>Page</span>
                    <input type="number" min={1} max={totalPages} value={page}
                      onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= totalPages) setPage(v); }}
                      style={{ width: "44px", textAlign: "center", padding: "3px 6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px" }} />
                    <span>of {totalPages}</span>
                  </div>
                  {/* Next */}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ width: 28, height: 28, borderRadius: "6px", border: "1px solid var(--border)", background: page === totalPages ? "var(--bg)" : "var(--surface)", cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "var(--text-muted)" : "var(--text)", fontWeight: 700, fontSize: "14px" }}>
                    ›
                  </button>
                  {/* Rows per page */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span>Rows per page:</span>
                    <select value={rowsPerPage} onChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(1); }}
                      style={{ padding: "3px 6px", border: "1px solid var(--border)", borderRadius: "6px", fontSize: "13px", background: "var(--surface)" }}>
                      {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Right stat cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Total students */}
          <div className="card" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 500 }}>Total Number of Students</div>
            <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{clients.length}</div>
            {clients.length > 0 && (
              <div style={{ marginTop: "0.5rem", fontSize: "13px", fontWeight: 600, color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                <span>▲</span> 100% from last month
              </div>
            )}
          </div>

          {/* Active plans */}
          <div className="card" style={{ textAlign: "left" }}>
            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 500 }}>Active Plans</div>
            <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#0F6E56", lineHeight: 1 }}>{activeCount}</div>
            <div style={{ marginTop: "0.5rem", fontSize: "12px", color: "var(--text-muted)" }}>Currently running</div>
          </div>

          {/* Need renewal */}
          {endedCount > 0 && (
            <div className="card" style={{ textAlign: "left", borderColor: "#F59E0B", background: "#FFFBEB" }}>
              <div style={{ fontSize: "13px", color: "#92400E", marginBottom: "0.4rem", fontWeight: 500 }}>Need Renewal</div>
              <div style={{ fontSize: "2.8rem", fontWeight: 800, color: "#D97706", lineHeight: 1 }}>{endedCount}</div>
              <div style={{ marginTop: "0.5rem", fontSize: "12px", color: "#B45309" }}>Plans ended</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
