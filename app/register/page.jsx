"use client";
import { useState } from "react";

const GOALS = ["PCOS/PCOD Management", "Weight Loss", "Flexibility", "Back Pain Relief", "Stress Relief", "Mental Health", "General Fitness", "Neck/Cervical Pain", "Knee Pain Relief", "Heel/Ankle Pain", "Physical & Mental Wellbeing", "Strength Building"];
const CONDITIONS = ["PCOS/PCOD", "Thyroid (Hypo)", "Thyroid (Hyper)", "Diabetes", "High BP", "Low BP", "Asthma", "Anxiety/Stress", "Depression", "Cervical Spondylosis", "Lumbar Spondylosis", "Slip Disc", "Sciatica", "Arthritis"];
const INJURIES = ["Knee Injury", "Shoulder Injury", "Hip Injury", "Ankle/Heel Injury", "Wrist Injury", "Spine Injury"];
const SURGERIES = ["Knee Arthroscopy", "ACL Repair", "Knee Replacement", "Rotator Cuff", "Hip Replacement", "Spine Surgery", "Abdominal Surgery", "Other"];
const STEPS = ["Personal Info", "Goals", "Health", "Injuries & Surgery", "Lifestyle", "Review"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "", phone: "", height: "", weight: "",
    occupation: "", experience: "beginner",
    goals: [], conditions: [], injuries: [], surgeries: [], familyHistory: [],
    conditionDetails: "", surgeryDetails: "", injuryDetails: "",
    mentalHealthDetails: "", medicationDetails: "",
    stressLevel: "", sleepPattern: "", angerLevel: "",
    mealType: "", stayType: "", notes: "",
  });

  function toggle(field, val) {
    setForm(f => ({ ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val] }));
  }

  function bmi() {
    const h = parseFloat(form.height) / 100;
    const w = parseFloat(form.weight);
    if (!h || !w) return null;
    return (w / (h * h)).toFixed(1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          goals: form.goals.join(","),
          conditions: form.conditions.join(","),
          injuries: form.injuries.join(","),
          surgeries: form.surgeries.join(","),
          familyHistory: form.familyHistory.join(","),
          registrationStatus: "pending",
        }),
      });
      setSubmitted(true);
    } catch (err) { console.error(err); }
    setSubmitting(false);
  }

  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "white", borderRadius: "16px", padding: "2.5rem", maxWidth: "400px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🙏</div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1D9E75", marginBottom: "0.75rem" }}>Registration Submitted!</h1>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "1rem" }}>Your instructor will review your details and contact you within 24 hours with your login details.</p>
        <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "1rem", fontSize: "0.85rem", color: "#0F6E56" }}>
          Your instructor will review your details and share your login PIN on WhatsApp at <strong>{form.phone}</strong>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f0f7f4", padding: "1rem" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto" }}>

        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "2rem" }}>🧘</div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1D9E75" }}>Navira Yoga Studio</h1>
          <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Student Registration</p>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ width: "32px", height: "32px", borderRadius: "50%", background: i <= step ? "#1D9E75" : "#e5e7eb", color: i <= step ? "white" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>
                {i < step ? "✓" : i + 1}
              </div>
            ))}
          </div>
          <div style={{ height: "4px", background: "#e5e7eb", borderRadius: "999px" }}>
            <div style={{ height: "100%", background: "#1D9E75", borderRadius: "999px", width: `${(step / (STEPS.length - 1)) * 100}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ textAlign: "center", marginTop: "0.5rem", fontSize: "0.8rem", color: "#1D9E75", fontWeight: 600 }}>
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </div>
        </div>

        <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem" }}>

          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018" }}>👤 Personal Information</h2>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Full Name *</label>
                <input className="form-input" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ width: "100%" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Age *</label>
                  <input className="form-input" type="number" min="15" max="80" placeholder="Age" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Gender *</label>
                  <select className="form-select" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} style={{ width: "100%" }}>
                    <option value="">Select</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Phone (WhatsApp) *</label>
                <input className="form-input" type="tel" placeholder="Your WhatsApp number" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={{ width: "100%" }} />
                <p style={{ fontSize: "0.72rem", color: "#9ca3af", marginTop: "4px" }}>Your instructor will share your PIN on this number</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Height (cm)</label>
                  <input className="form-input" type="number" placeholder="e.g. 165" value={form.height} onChange={e => setForm(f => ({ ...f, height: e.target.value }))} style={{ width: "100%" }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Weight (kg)</label>
                  <input className="form-input" type="number" placeholder="e.g. 65" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} style={{ width: "100%" }} />
                </div>
              </div>
              {bmi() && (
                <div style={{ background: "#E1F5EE", borderRadius: "8px", padding: "0.75rem", fontSize: "0.85rem", color: "#0F6E56", textAlign: "center" }}>
                  BMI: <strong>{bmi()}</strong> — {parseFloat(bmi()) < 18.5 ? "Underweight" : parseFloat(bmi()) < 25 ? "Normal ✅" : parseFloat(bmi()) < 30 ? "Overweight" : "Obese"}
                </div>
              )}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Occupation</label>
                <select className="form-select" value={form.occupation} onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} style={{ width: "100%" }}>
                  <option value="">Select occupation</option>
                  {["Desk Job (IT/Office)", "Physical Work", "Student", "Homemaker", "Teacher", "Healthcare", "Business", "Retired", "Other"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018" }}>🎯 Your Goals</h2>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.75rem" }}>What do you want to achieve? (Select all)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {GOALS.map(g => (
                    <button key={g} onClick={() => toggle("goals", g)} style={{ padding: "0.6rem 0.5rem", borderRadius: "8px", border: `2px solid ${form.goals.includes(g) ? "#1D9E75" : "#e5e7eb"}`, background: form.goals.includes(g) ? "#E1F5EE" : "white", color: form.goals.includes(g) ? "#0F6E56" : "#374151", fontSize: "0.75rem", fontWeight: form.goals.includes(g) ? 700 : 400, cursor: "pointer", textAlign: "left" }}>
                      {form.goals.includes(g) ? "✅ " : ""}{g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Yoga Experience *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {["beginner", "intermediate", "advanced"].map(e => (
                    <button key={e} onClick={() => setForm(f => ({ ...f, experience: e }))} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", border: `2px solid ${form.experience === e ? "#1D9E75" : "#e5e7eb"}`, background: form.experience === e ? "#E1F5EE" : "white", color: form.experience === e ? "#0F6E56" : "#374151", fontSize: "0.8rem", fontWeight: form.experience === e ? 700 : 400, cursor: "pointer", textTransform: "capitalize" }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018" }}>🏥 Health Conditions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                {CONDITIONS.map(c => (
                  <button key={c} onClick={() => toggle("conditions", c)} style={{ padding: "0.6rem 0.5rem", borderRadius: "8px", border: `2px solid ${form.conditions.includes(c) ? "#1D9E75" : "#e5e7eb"}`, background: form.conditions.includes(c) ? "#E1F5EE" : "white", color: form.conditions.includes(c) ? "#0F6E56" : "#374151", fontSize: "0.75rem", cursor: "pointer", textAlign: "left" }}>
                    {form.conditions.includes(c) ? "✅ " : ""}{c}
                  </button>
                ))}
              </div>
              {form.conditions.length > 0 && (
                <div style={{ background: "#FFF7ED", borderRadius: "10px", padding: "1rem", border: "1px solid #F59E0B" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E", display: "block", marginBottom: "0.4rem" }}>Describe your conditions in detail</label>
                  <textarea className="form-textarea" rows={3} placeholder="Duration, severity, medications, doctor diagnosed?" value={form.conditionDetails} onChange={e => setForm(f => ({ ...f, conditionDetails: e.target.value }))} style={{ width: "100%" }} />
                </div>
              )}
              {(form.conditions.includes("Anxiety/Stress") || form.conditions.includes("Depression")) && (
                <div style={{ background: "#F5F3FF", borderRadius: "10px", padding: "1rem", border: "1px solid #C4B5FD" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#6D28D9", display: "block", marginBottom: "0.75rem" }}>🧠 Mental Health Details</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#374151", alignSelf: "center", minWidth: "100px" }}>On medication?</span>
                      {["Yes", "No"].map(o => <button key={o} onClick={() => setForm(f => ({ ...f, mentalHealthDetails: f.mentalHealthDetails + " Med:" + o }))} style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "0.75rem", cursor: "pointer" }}>{o}</button>)}
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <span style={{ fontSize: "0.75rem", color: "#374151", alignSelf: "center", minWidth: "100px" }}>In therapy?</span>
                      {["Yes", "No"].map(o => <button key={o} onClick={() => setForm(f => ({ ...f, mentalHealthDetails: f.mentalHealthDetails + " Therapy:" + o }))} style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "0.75rem", cursor: "pointer" }}>{o}</button>)}
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Current medications (if any)</label>
                <textarea className="form-textarea" rows={2} placeholder="List any medications you are taking..." value={form.medicationDetails} onChange={e => setForm(f => ({ ...f, medicationDetails: e.target.value }))} style={{ width: "100%" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Family History</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {["Diabetes", "Heart Disease", "High BP", "Thyroid", "Cancer", "Arthritis", "None"].map(f => (
                    <button key={f} onClick={() => toggle("familyHistory", f)} style={{ padding: "0.5rem", borderRadius: "8px", border: `2px solid ${form.familyHistory.includes(f) ? "#1D9E75" : "#e5e7eb"}`, background: form.familyHistory.includes(f) ? "#E1F5EE" : "white", color: form.familyHistory.includes(f) ? "#0F6E56" : "#374151", fontSize: "0.75rem", cursor: "pointer" }}>
                      {form.familyHistory.includes(f) ? "✅ " : ""}{f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018" }}>🦴 Injuries & Surgery</h2>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Current Injuries</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {INJURIES.map(i => (
                    <button key={i} onClick={() => toggle("injuries", i)} style={{ padding: "0.6rem 0.5rem", borderRadius: "8px", border: `2px solid ${form.injuries.includes(i) ? "#F59E0B" : "#e5e7eb"}`, background: form.injuries.includes(i) ? "#FFFBEB" : "white", color: form.injuries.includes(i) ? "#92400E" : "#374151", fontSize: "0.75rem", cursor: "pointer", textAlign: "left" }}>
                      {form.injuries.includes(i) ? "⚠️ " : ""}{i}
                    </button>
                  ))}
                </div>
              </div>
              {form.injuries.length > 0 && (
                <div style={{ background: "#FFFBEB", borderRadius: "10px", padding: "1rem", border: "1px solid #F59E0B" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#92400E", display: "block", marginBottom: "0.4rem" }}>Injury Details</label>
                  <textarea className="form-textarea" rows={3} placeholder="Which side? How long ago? Severity? Currently in pain?" value={form.injuryDetails} onChange={e => setForm(f => ({ ...f, injuryDetails: e.target.value }))} style={{ width: "100%" }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Surgery History</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {SURGERIES.map(s => (
                    <button key={s} onClick={() => toggle("surgeries", s)} style={{ padding: "0.6rem 0.5rem", borderRadius: "8px", border: `2px solid ${form.surgeries.includes(s) ? "#DC2626" : "#e5e7eb"}`, background: form.surgeries.includes(s) ? "#FEF2F2" : "white", color: form.surgeries.includes(s) ? "#DC2626" : "#374151", fontSize: "0.75rem", cursor: "pointer", textAlign: "left" }}>
                      {form.surgeries.includes(s) ? "🔴 " : ""}{s}
                    </button>
                  ))}
                </div>
              </div>
              {form.surgeries.length > 0 && (
                <div style={{ background: "#FEF2F2", borderRadius: "10px", padding: "1rem", border: "1px solid #FCA5A5" }}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: "#DC2626", display: "block", marginBottom: "0.75rem" }}>Surgery Details</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#374151", display: "block", marginBottom: "0.3rem" }}>Which side?</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {["Left", "Right", "Both", "N/A"].map(o => (
                          <button key={o} onClick={() => setForm(f => ({ ...f, surgeryDetails: f.surgeryDetails + " Side:" + o }))} style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "0.7rem", cursor: "pointer" }}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#374151", display: "block", marginBottom: "0.3rem" }}>How long ago?</label>
                      <input className="form-input" placeholder="e.g. 6 months, 2 years" style={{ width: "100%" }} onChange={e => setForm(f => ({ ...f, surgeryDetails: f.surgeryDetails + " When:" + e.target.value }))} />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#374151", display: "block", marginBottom: "0.3rem" }}>Physiotherapy done?</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {["Yes", "No", "Ongoing"].map(o => (
                          <button key={o} onClick={() => setForm(f => ({ ...f, surgeryDetails: f.surgeryDetails + " Physio:" + o }))} style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "0.75rem", cursor: "pointer" }}>{o}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "0.75rem", color: "#374151", display: "block", marginBottom: "0.3rem" }}>Doctor cleared for yoga?</label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {["Yes", "No", "Not Asked"].map(o => (
                          <button key={o} onClick={() => setForm(f => ({ ...f, surgeryDetails: f.surgeryDetails + " Cleared:" + o }))} style={{ flex: 1, padding: "0.4rem", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "white", fontSize: "0.75rem", cursor: "pointer" }}>{o}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018" }}>🌿 Lifestyle & Habits</h2>
              {[
                { label: "Sleep Pattern", field: "sleepPattern", options: ["Good (7-8 hrs)", "Disturbed Sleep", "Insomnia", "Oversleeping"] },
                { label: "Stress Level", field: "stressLevel", options: ["Low", "Medium", "High", "Very High"] },
                { label: "Anger Level", field: "angerLevel", options: ["Low", "Normal", "High"] },
                { label: "Meal Type", field: "mealType", options: ["Vegetarian", "Non-Vegetarian", "Vegan"] },
                { label: "Stay Type", field: "stayType", options: ["Family", "Flat", "Hostel"] },
              ].map(({ label, field, options }) => (
                <div key={field}>
                  <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>{label}</label>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {options.map(o => (
                      <button key={o} onClick={() => setForm(f => ({ ...f, [field]: o }))} style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", border: `2px solid ${form[field] === o ? "#1D9E75" : "#e5e7eb"}`, background: form[field] === o ? "#E1F5EE" : "white", color: form[field] === o ? "#0F6E56" : "#374151", fontSize: "0.75rem", fontWeight: form[field] === o ? 700 : 400, cursor: "pointer" }}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Anything else to share with instructor</label>
                <textarea className="form-textarea" rows={3} placeholder="Any other relevant information..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ width: "100%" }} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018", marginBottom: "1rem" }}>✅ Review & Submit</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {[
                  ["Name", form.name],
                  ["Age / Gender", `${form.age} / ${form.gender}`],
                  ["Phone", form.phone],
                  ["Height / Weight", form.height && form.weight ? `${form.height}cm / ${form.weight}kg (BMI: ${bmi()})` : "Not provided"],
                  ["Occupation", form.occupation || "Not provided"],
                  ["Experience", form.experience],
                  ["Goals", form.goals.join(", ") || "None"],
                  ["Conditions", form.conditions.join(", ") || "None"],
                  ["Injuries", form.injuries.join(", ") || "None"],
                  ["Surgeries", form.surgeries.join(", ") || "None"],
                  ["Sleep", form.sleepPattern || "Not provided"],
                  ["Stress", form.stressLevel || "Not provided"],
                  ["Meal", form.mealType || "Not provided"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", gap: "0.5rem", fontSize: "0.82rem", paddingBottom: "0.5rem", borderBottom: "1px solid #f3f4f6" }}>
                    <span style={{ color: "#6b7280", minWidth: "90px", fontWeight: 600 }}>{label}:</span>
                    <span style={{ color: "#1a2018" }}>{value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "1rem", marginTop: "1rem", fontSize: "0.8rem", color: "#0F6E56" }}>
                ✅ By submitting you confirm all information is accurate. Instructor will contact you within 24 hours.
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{ flex: 1, padding: "0.85rem", background: "white", color: "#374151", border: "2px solid #e5e7eb", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 600, cursor: "pointer" }}>← Back</button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && (!form.name || !form.age || !form.phone)} style={{ flex: 1, padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", opacity: step === 0 && (!form.name || !form.age || !form.phone) ? 0.5 : 1 }}>Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={{ flex: 1, padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer" }}>
              {submitting ? "Submitting..." : "🙏 Submit Registration"}
            </button>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "1rem" }}>Navira Yoga Studio · Your data is safe and private</p>
      </div>
    </div>
  );
}
