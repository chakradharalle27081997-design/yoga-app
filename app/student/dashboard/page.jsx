"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportSequencePDF } from "@/lib/pdfExport";
import { getPoseImage } from "@/lib/poseImages";

function getPoseReps(pose, cycleNumber) {
  const cycle = parseInt(cycleNumber) || 1;
  const type = pose.poseType || "general";
  const base = {
    backbend:    { reps: "5-6", max: 8,  hold: 5 },
    core:        { reps: "6",   max: 12, hold: 5 },
    standing:    { reps: "6",   max: 12, hold: 5, eachSide: true },
    twist:       { reps: "6",   max: 10, hold: 5, eachSide: true },
    restorative: { reps: null,  max: null, hold: 10 },
    hipopener:   { reps: "6",   max: 12, hold: 8, eachSide: true },
    forward:     { reps: "5",   max: 10, hold: 5 },
    general:     { reps: "6",   max: 12, hold: 5 },
  }[type] || { reps: "6", max: 12, hold: 5 };
  const holdIncrease = [0, 3, 5, 7];
  const repIncrease  = [0, 2, 4, 6];
  const idx = Math.min(cycle - 1, 3);
  const holdBreaths = base.hold + holdIncrease[idx];
  const side = base.eachSide ? " each side" : "";
  if (!base.reps) return { reps: null, hold: holdBreaths + " breaths", side: "" };
  const baseNum = parseInt(base.reps.split("-").pop());
  const newMax = Math.min(baseNum + repIncrease[idx], base.max);
  const newMin = Math.min(parseInt(base.reps.split("-")[0]) + repIncrease[idx], base.max);
  const repsStr = newMin === newMax ? String(newMax) : newMin + "-" + newMax;
  return { reps: repsStr + " times" + side, hold: holdBreaths + " breaths", side };
}

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [sequences, setSequences] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [moodMap, setMoodMap] = useState({});
  const [showMood, setShowMood] = useState(false);
  const [selectedPose, setSelectedPose] = useState(null);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [activeTab, setActiveTab] = useState("plan");
  const router = useRouter();

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    const studentName = localStorage.getItem("studentName");
    if (!studentId) { router.push("/student"); return; }
    setStudent({ id: studentId, name: studentName });
    fetch(`/api/clients/${studentId}`)
      .then(r => r.json())
      .then(data => {
        setClientData(data);
        if (data && data.sequences) {
          setSequences(data.sequences);
          const current = data.sequences.find(s => getPlanStatus(s) === "active");
          if (current) loadAttendance(studentId, current.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    const savedMood = JSON.parse(localStorage.getItem("moodMap") || "{}");
    setMoodMap(savedMood);
  }, []);

  async function loadAttendance(clientId, sequenceId) {
    const res = await fetch(`/api/attendance?clientId=${clientId}&sequenceId=${sequenceId}`);
    const records = await res.json();
    const map = {};
    records.forEach(r => { map[r.day] = r.attended; });
    setAttendance(map);
  }

  async function toggleDay(sequenceId, day) {
    const clientId = student.id;
    const newVal = !attendance[day];
    setAttendance(prev => ({ ...prev, [day]: newVal }));
    if (newVal) setShowMood(true);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, sequenceId, day, attended: newVal })
    });
  }

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

  function formatDateShort(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
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

  function getDaysLeft(seq) {
    const { end } = getPlanDates(seq);
    const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }

  function getStreak() {
    let streak = 0;
    for (let i = 1; i <= 10; i++) {
      if (attendance[i]) streak++;
      else break;
    }
    return streak;
  }

  function saveMood(day, mood) {
    const updated = { ...moodMap, [day]: mood };
    setMoodMap(updated);
    localStorage.setItem("moodMap", JSON.stringify(updated));
    setShowMood(false);
  }

  function handleDownloadCertificate() {
    const name = student?.name || "Student";
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Certificate</title>
      <style>
        body { font-family: serif; text-align: center; padding: 60px; background: #f0f7f4; }
        .cert { background: white; border: 8px solid #1D9E75; border-radius: 24px; padding: 60px; max-width: 700px; margin: 0 auto; }
        h1 { color: #1D9E75; font-size: 2.5rem; margin-bottom: 0.5rem; }
        h2 { color: #C17F3A; font-size: 1.8rem; margin: 1rem 0; }
        p { color: #555; font-size: 1.1rem; line-height: 1.8; }
        .om { font-size: 4rem; color: #1D9E75; margin-bottom: 1rem; }
        .date { font-size: 0.9rem; color: #999; margin-top: 2rem; }
        .studio { font-size: 1rem; font-weight: bold; color: #1D9E75; margin-top: 1rem; }
      </style></head>
      <body onload="window.print()">
        <div class="cert">
          <div class="om">ॐ</div>
          <h1>Certificate of Completion</h1>
          <p>This is to certify that</p>
          <h2>${name}</h2>
          <p>has successfully completed a <strong>10-Day Yoga Practice Cycle</strong><br/>
          with dedication, consistency, and mindfulness.</p>
          <p style="font-style:italic; color:#1D9E75; margin-top:1.5rem;">
            "Yogaḥ citta-vṛtti nirodhaḥ"<br/>
            <span style="font-size:0.9rem; color:#999;">Yoga is the stilling of the fluctuations of the mind.</span>
          </p>
          <div class="date">Completed on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</div>
          <div class="studio">🧘 IRA Yoga Studio</div>
        </div>
      </body></html>
    `);
    win.document.close();
  }

  function getPoses(seq) {
    try {
      const data = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      return data?.phases?.find(p => p.phase === "Asanas")?.poses || [];
    } catch { return []; }
  }

  function getWarmupPoses(seq) {
    try {
      const data = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      return (data?.phases?.find(p => p.phase === "Warm-up")?.poses || []).filter(p =>
        !p.name?.toLowerCase().includes("surya") && !p.name?.toLowerCase().includes("sun salutation")
      );
    } catch { return []; }
  }

  function getPranayamaPoses(seq) {
    try {
      const data = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      return data?.phases?.find(p => p.phase === "Pranayama")?.poses || [];
    } catch { return []; }
  }

  function showSuryaBanner(seq) {
    if (!clientData) return false;
    const severeConditions = ["High Blood Pressure", "Heart Condition", "Slipped Disk"];
    const conditions = Array.isArray(clientData.conditions) ? clientData.conditions : (clientData.conditions || "").split(",").filter(Boolean);
    const injuries = Array.isArray(clientData.injuries) ? clientData.injuries : (clientData.injuries || "").split(",").filter(Boolean);
    const hasSevere = [...conditions, ...injuries].some(c => severeConditions.includes(c));
    const isBeginnerCycle1 = clientData.experience === "beginner" && (seq.cycleNumber || 1) === 1;
    return !hasSevere && !isBeginnerCycle1;
  }

  const currentPlan = sequences.find(s => getPlanStatus(s) === "active");
  const pastPlans = sequences.filter(s => getPlanStatus(s) === "completed");
  const attendedCount = Object.values(attendance).filter(Boolean).length;
  const streak = getStreak();
  const daysLeft = currentPlan ? getDaysLeft(currentPlan) : 0;
  const todayDay = currentPlan ? (() => {
    const start = new Date(currentPlan.createdAt);
    const diff = Math.floor((new Date() - start) / (1000 * 60 * 60 * 24));
    return Math.min(diff + 1, 10);
  })() : 0;
  const MOODS = ["😔", "😐", "🙂", "😊", "🤩"];

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0a2a1f 0%, #1D9E75 100%)" }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem", animation: "pulse 2s infinite" }}>🧘</div>
        <p style={{ fontSize: "1rem", opacity: 0.8 }}>Loading your practice...</p>
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .student-app { font-family: 'DM Sans', sans-serif; min-height: 100vh; background: #f5f7f2; }
        .header-bar { background: linear-gradient(135deg, #0d3b2a 0%, #1D9E75 100%); color: white; padding: 1rem 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        .header-title { font-family: 'Playfair Display', serif; font-size: 1.2rem; font-weight: 700; }
        .header-sub { font-size: 0.8rem; opacity: 0.75; margin-top: 2px; }
        .logout-btn { background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.8rem; font-family: 'DM Sans', sans-serif; transition: all 0.2s; }
        .logout-btn:hover { background: rgba(255,255,255,0.25); }
        .tab-bar { background: white; border-bottom: 1px solid #e8ede8; display: flex; padding: 0 1rem; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .tab-btn { padding: 0.85rem 1.25rem; border: none; background: transparent; font-family: 'DM Sans', sans-serif; font-size: 0.85rem; font-weight: 500; color: #888; cursor: pointer; border-bottom: 2.5px solid transparent; transition: all 0.2s; white-space: nowrap; }
        .tab-btn.active { color: #1D9E75; border-bottom-color: #1D9E75; font-weight: 600; }
        .main-content { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } .main-content { padding: 1rem; } }
        .card { background: white; border-radius: 16px; padding: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); margin-bottom: 1rem; }
        .card-title { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #1a2018; margin-bottom: 1rem; }
        .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; margin-bottom: 1rem; }
        .stat-box { background: linear-gradient(135deg, #f0faf5, #e8f5ee); border-radius: 12px; padding: 0.85rem; text-align: center; border: 1px solid #c8e8d8; }
        .stat-num { font-size: 1.6rem; font-weight: 800; color: #1D9E75; font-family: 'Playfair Display', serif; }
        .stat-label { font-size: 0.7rem; color: #5a7a6a; font-weight: 500; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.05em; }
        .plan-badge { background: #E1F5EE; color: #0F6E56; font-size: 0.72rem; font-weight: 700; padding: 4px 12px; border-radius: 20px; display: inline-block; }
        .alert-box { background: #FFF7ED; border: 1.5px solid #F59E0B; border-radius: 12px; padding: 0.85rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
        .pose-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; }
        @media (min-width: 769px) { .pose-grid { grid-template-columns: repeat(4, 1fr); } }
        .pose-card { background: #f9fafb; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
        .pose-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
        .pose-card img { width: 100%; height: 100px; object-fit: contain; background: white; display: block; }
        .pose-card-body { padding: 0.5rem 0.6rem; }
        .pose-name { font-size: 0.7rem; font-weight: 600; color: #1a2018; line-height: 1.3; }
        .pose-duration { font-size: 0.62rem; color: #9ca3af; margin-top: 2px; }
        .attendance-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
        .day-btn { background: white; border: 2px solid #e5e7eb; border-radius: 12px; padding: 0.6rem 0.4rem; cursor: pointer; text-align: center; transition: all 0.2s; }
        .day-btn.done { background: #1D9E75; border-color: #1D9E75; }
        .day-emoji { font-size: 1rem; }
        .day-num { font-size: 0.65rem; font-weight: 700; color: #6b7280; margin-top: 3px; }
        .day-btn.done .day-num { color: white; }
        .day-date { font-size: 0.58rem; color: #9ca3af; }
        .day-btn.done .day-date { color: rgba(255,255,255,0.75); }
        .warmup-tag { display: inline-block; background: #FFF7ED; color: #92400E; font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; margin: 2px; border: 1px solid #FDE68A; }
        .prana-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid #f0f0f0; }
        .prana-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366F1; flex-shrink: 0; }
        .mood-picker { display: flex; justify-content: center; gap: 0.75rem; margin-top: 0.75rem; }
        .mood-btn { font-size: 1.8rem; background: transparent; border: 2px solid transparent; border-radius: 10px; padding: 6px; cursor: pointer; transition: all 0.2s; }
        .mood-btn.selected { background: #E1F5EE; border-color: #1D9E75; }
        .surya-banner { background: linear-gradient(135deg, #FFF7ED, #FFFBEB); border: 1.5px solid #F59E0B; border-radius: 12px; padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.75rem; }
        .past-cycle { background: #f9fafb; border-radius: 12px; overflow: hidden; margin-bottom: 0.75rem; border: 1px solid #e8ede8; }
        .past-cycle-header { padding: 0.85rem 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
        .past-cycle-body { padding: 0.75rem 1rem; border-top: 1px solid #e5e7eb; }
        .print-btn { background: #1D9E75; color: white; border: none; border-radius: 10px; padding: 0.75rem 1.25rem; font-size: 0.95rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; width: 100%; margin-bottom: 0.75rem; transition: background 0.2s; }
        .print-btn:hover { background: #0d7a5a; }
        .wa-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.75rem; background: #25D366; color: white; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 700; cursor: pointer; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
        .wa-btn:hover { background: #1da851; }
        .section-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
        .progress-bar { height: 8px; background: #e5e7eb; border-radius: 999px; overflow: hidden; margin-top: 0.5rem; }
        .progress-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #1D9E75, #25D366); transition: width 0.5s ease; }
        .popup-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; backdrop-filter: blur(4px); }
        .popup-box { background: white; border-radius: 20px; max-width: 440px; width: 100%; max-height: 88vh; overflow: auto; }
        .popup-img { width: 100%; height: 210px; object-fit: contain; background: #f9fafb; border-radius: 20px 20px 0 0; }
        .popup-body { padding: 1.25rem; }
        .badge { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; display: inline-block; }
        .badge-green { background: #E1F5EE; color: #1D9E75; }
        .badge-blue { background: #EEF2FF; color: #3730A3; }
        .cert-btn { background: linear-gradient(135deg, #1D9E75, #0d7a5a); color: white; border: none; border-radius: 10px; padding: 10px 24px; font-size: 0.88rem; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease; }
      `}</style>

      <div className="student-app">
        {/* Header */}
        <div className="header-bar">
          <div>
            <div className="header-title">🧘 IRA Yoga Studio</div>
            <div className="header-sub">Welcome, {student?.name}!</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>

        {/* Tab Bar */}
        <div className="tab-bar">
          {[
            { id: "plan", label: "📋 My Plan" },
            { id: "asanas", label: "🧘 Asanas" },
            { id: "attendance", label: "📅 Attendance" },
            { id: "history", label: "📚 History" },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="main-content fade-in">

          {/* Renewal Alert */}
          {currentPlan && daysLeft <= 3 && daysLeft > 0 && (
            <div className="alert-box">
              <span style={{ fontSize: "1.3rem" }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#92400E" }}>Plan expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}!</div>
                <div style={{ fontSize: "0.8rem", color: "#B45309" }}>Contact your instructor to renew.</div>
              </div>
            </div>
          )}

          {/* ── TAB: MY PLAN ── */}
          {activeTab === "plan" && (
            <div className="two-col">
              {/* LEFT */}
              <div>
                {/* Stats */}
                {currentPlan && (
                  <div className="stat-grid">
                    <div className="stat-box">
                      <div className="stat-num">🔥{streak}</div>
                      <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">{attendedCount}</div>
                      <div className="stat-label">Days Done</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">{daysLeft}</div>
                      <div className="stat-label">Days Left</div>
                    </div>
                  </div>
                )}

                {/* Mood */}
                {currentPlan && (
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="card-title" style={{ marginBottom: 0 }}>Today's Mood</div>
                      <span style={{ fontSize: "1.8rem", cursor: "pointer" }} onClick={() => setShowMood(!showMood)}>{moodMap[todayDay] || "😐"}</span>
                    </div>
                    {showMood && (
                      <div>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: "0.75rem 0 0.5rem" }}>How do you feel after practice?</p>
                        <div className="mood-picker">
                          {MOODS.map((m, i) => (
                            <button key={i} className={`mood-btn ${moodMap[todayDay] === m ? "selected" : ""}`} onClick={() => saveMood(todayDay, m)}>{m}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Plan Info */}
                {currentPlan ? (
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                      <div>
                        <div className="card-title" style={{ marginBottom: "4px" }}>Current Plan</div>
                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>Cycle {currentPlan.cycleNumber} · {currentPlan.style} · {currentPlan.duration} min</div>
                        <div style={{ fontSize: "0.78rem", color: "#6b7280" }}>{formatDate(getPlanDates(currentPlan).start)} — {formatDate(getPlanDates(currentPlan).end)}</div>
                      </div>
                      <span className="plan-badge">🟢 Active</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                      <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Goal</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2018" }}>{currentPlan.goal}</div>
                      </div>
                      <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem" }}>
                        <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Energy</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1a2018", textTransform: "capitalize" }}>{currentPlan.energy}</div>
                      </div>
                    </div>
                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#6b7280", marginBottom: "4px" }}>
                        <span>Progress</span><span>{attendedCount}/10 days</span>
                      </div>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${attendedCount * 10}%` }} /></div>
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                    <div style={{ fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>No Active Plan</div>
                    <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your instructor will generate your plan soon!</div>
                  </div>
                )}

                {/* Actions */}
                {currentPlan && (
                  <div className="card">
                    <div className="card-title">Quick Actions</div>
                    <button className="print-btn" onClick={() => handlePrint(currentPlan)}>🖨️ Print / Download My Plan</button>
                    <a className="wa-btn" href={`https://wa.me/917996272792?text=Hi%20IRA%20Yoga%20Studio%2C%20I%20am%20${encodeURIComponent(student?.name || "")}%20and%20I%20need%20help.`} target="_blank" rel="noopener noreferrer">
                      <span>💬</span> Contact Instructor on WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div>
                {/* Warm-up */}
                {currentPlan && getWarmupPoses(currentPlan).length > 0 && (
                  <div className="card">
                    <div className="section-label" style={{ color: "#92400E" }}>🔥 Warm-up</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {getWarmupPoses(currentPlan).map((p, i) => <span key={i} className="warmup-tag">{p.name}</span>)}
                    </div>
                  </div>
                )}

                {/* Surya Banner */}
                {currentPlan && showSuryaBanner(currentPlan) && (
                  <div className="surya-banner">
                    <div style={{ fontSize: "2rem" }}>🌅</div>
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#92400E" }}>Surya Namaskar — Before Asanas</div>
                      <div style={{ fontSize: "0.78rem", color: "#B45309", marginTop: "2px" }}>Begin with <strong>12 rounds daily</strong>, increase gradually.</div>
                    </div>
                  </div>
                )}

                {/* Pranayama */}
                {currentPlan && getPranayamaPoses(currentPlan).length > 0 && (
                  <div className="card">
                    <div className="section-label" style={{ color: "#3730A3" }}>🌬️ Pranayama</div>
                    {getPranayamaPoses(currentPlan).map((p, i) => (
                      <div key={i} className="prana-item">
                        <div className="prana-dot" />
                        <div>
                          <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1a2018" }}>{p.name}</div>
                          {p.duration && <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>{p.duration}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: ASANAS ── */}
          {activeTab === "asanas" && currentPlan && (
            <div>
              <div className="card" style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="card-title" style={{ marginBottom: 0 }}>Your Asana Practice</div>
                  <span className="plan-badge">Cycle {currentPlan.cycleNumber}</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "4px" }}>Tap any pose to see instructions and how many times to do it.</p>
              </div>
              <div className="pose-grid">
                {getPoses(currentPlan).map((pose, i) => {
                  const imgSrc = getPoseImage(pose.sanskrit || pose.name, "Asanas");
                  return (
                    <div key={i} className="pose-card" onClick={() => setSelectedPose(pose)}>
                      {imgSrc
                        ? <img src={imgSrc} alt={pose.name} onError={e => e.target.style.display = "none"} />
                        : <div style={{ width: "100%", height: "100px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🧘</div>
                      }
                      <div className="pose-card-body">
                        <div style={{ fontSize: "0.7rem", color: "#C0392B", fontWeight: 700, marginBottom: "2px" }}>{pose.sanskrit || pose.name}</div>
                        <div className="pose-name" style={{ color: "#6b7280", fontSize: "0.65rem" }}>{pose.name}</div>
                        {pose.duration && <div className="pose-duration">⏱ {pose.duration}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "asanas" && !currentPlan && (
            <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</div>
              <div style={{ fontWeight: 700, color: "#1a2018" }}>No active plan yet</div>
            </div>
          )}

          {/* ── TAB: ATTENDANCE ── */}
          {activeTab === "attendance" && (
            <div className="two-col">
              <div>
                {currentPlan ? (
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div className="card-title" style={{ marginBottom: 0 }}>10-Day Tracker</div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1D9E75" }}>{attendedCount}/10 days</span>
                    </div>
                    <div className="attendance-grid">
                      {Array.from({ length: 10 }, (_, i) => {
                        const day = i + 1;
                        const done = attendance[day];
                        const date = new Date(getPlanDates(currentPlan).start);
                        date.setDate(date.getDate() + i);
                        return (
                          <button key={day} className={`day-btn ${done ? "done" : ""}`} onClick={() => toggleDay(currentPlan.id, day)}>
                            <div className="day-emoji">{done ? "✅" : "⬜"}</div>
                            <div className="day-num">Day {day}</div>
                            <div className="day-date">{formatDateShort(date)}</div>
                          </button>
                        );
                      })}
                    </div>
                    {attendedCount === 10 && (
                      <div style={{ textAlign: "center", marginTop: "1.25rem", padding: "1rem", background: "linear-gradient(135deg, #E1F5EE, #f0faf5)", borderRadius: "12px" }}>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1D9E75", marginBottom: "0.75rem" }}>🎉 You completed all 10 days!</div>
                        <button className="cert-btn" onClick={handleDownloadCertificate}>🏆 Download Certificate</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card" style={{ textAlign: "center", padding: "2rem" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📅</div>
                    <div style={{ color: "#6b7280" }}>No active plan to track.</div>
                  </div>
                )}
              </div>

              <div>
                {/* Mood card */}
                {currentPlan && (
                  <div className="card">
                    <div className="card-title">Mood Log</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {Array.from({ length: 10 }, (_, i) => {
                        const day = i + 1;
                        const mood = moodMap[day];
                        const done = attendance[day];
                        return (
                          <div key={day} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: "1px solid #f3f4f6" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: done ? "#E1F5EE" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: done ? "#1D9E75" : "#9ca3af" }}>{day}</div>
                            <div style={{ fontSize: "0.8rem", color: "#6b7280", flex: 1 }}>Day {day}</div>
                            <div style={{ fontSize: "1.3rem" }}>{mood || (done ? "😐" : "—")}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── TAB: HISTORY ── */}
          {activeTab === "history" && (
            <div>
              {pastPlans.length === 0 ? (
                <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📚</div>
                  <div style={{ fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>No Past Cycles Yet</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your completed cycles will appear here.</div>
                </div>
              ) : (
                pastPlans.map(seq => (
                  <div key={seq.id} className="past-cycle">
                    <div className="past-cycle-header" onClick={() => setExpandedCycle(expandedCycle === seq.id ? null : seq.id)}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a2018" }}>Cycle {seq.cycleNumber} — {seq.style}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>{formatDate(getPlanDates(seq).start)} — {formatDate(getPlanDates(seq).end)} · {seq.goal}</div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button onClick={e => { e.stopPropagation(); handlePrint(seq); }} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "5px 12px", fontSize: "0.78rem", cursor: "pointer", color: "#374151" }}>🖨️ Print</button>
                        <span style={{ color: "#9ca3af" }}>{expandedCycle === seq.id ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {expandedCycle === seq.id && (
                      <div className="past-cycle-body">
                        {getWarmupPoses(seq).length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div className="section-label" style={{ color: "#92400E" }}>🔥 Warm-up</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {getWarmupPoses(seq).map((p, i) => <span key={i} className="warmup-tag">{p.name}</span>)}
                            </div>
                          </div>
                        )}
                        {getPoses(seq).length > 0 && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div className="section-label" style={{ color: "#0F6E56" }}>🧘 Asanas</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem" }}>
                              {getPoses(seq).map((pose, i) => {
                                const imgSrc = getPoseImage(pose.sanskrit || pose.name, "Asanas");
                                return (
                                  <div key={i} className="pose-card" onClick={() => setSelectedPose(pose)}>
                                    {imgSrc ? <img src={imgSrc} alt={pose.name} style={{ width: "100%", height: "70px", objectFit: "contain", background: "white", display: "block" }} /> : <div style={{ height: "70px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🧘</div>}
                                    <div style={{ padding: "0.3rem 0.4rem" }}>
                                      <div style={{ fontSize: "0.62rem", fontWeight: 600, color: "#1a2018", lineHeight: 1.3 }}>{pose.name}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {getPranayamaPoses(seq).length > 0 && (
                          <div>
                            <div className="section-label" style={{ color: "#3730A3" }}>🌬️ Pranayama</div>
                            {getPranayamaPoses(seq).map((p, i) => (
                              <div key={i} className="prana-item">
                                <div className="prana-dot" />
                                <div style={{ fontSize: "0.78rem", color: "#374151" }}>{p.name}{p.duration ? " — " + p.duration : ""}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Pose Detail Popup */}
        {selectedPose && (
          <div className="popup-overlay" onClick={() => setSelectedPose(null)}>
            <div className="popup-box fade-in" onClick={e => e.stopPropagation()}>
              {getPoseImage(selectedPose.sanskrit || selectedPose.name, "Asanas")
                ? <img className="popup-img" src={getPoseImage(selectedPose.sanskrit || selectedPose.name, "Asanas")} alt={selectedPose.name} />
                : <div style={{ width: "100%", height: "210px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", borderRadius: "20px 20px 0 0" }}>🧘</div>
              }
              <div className="popup-body">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#C0392B", fontFamily: "'Playfair Display', serif", marginBottom: "3px" }}>{selectedPose.sanskrit || selectedPose.name}</h2>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280", fontStyle: "italic" }}>{selectedPose.name}</p>
                    {selectedPose.duration && <p style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "4px" }}>⏱ {selectedPose.duration}</p>}
                    {(() => {
                      const r = getPoseReps(selectedPose, currentPlan?.cycleNumber || 1);
                      return (
                        <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                          {r.reps && <span className="badge badge-green">🔁 {r.reps}</span>}
                          <span className="badge badge-blue">🌬 Hold {r.hold}</span>
                        </div>
                      );
                    })()}
                  </div>
                  <button onClick={() => setSelectedPose(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>

                {selectedPose.cues && (
                  <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "0.75rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1a2018", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>📋 How to do</div>
                    <ol style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                      {String(Array.isArray(selectedPose.cues) ? selectedPose.cues.join(". ") : (selectedPose.cues || "")).split(".").filter(s => s.trim()).map((step, i) => (
                        <li key={i} style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6 }}>{step.trim()}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {(selectedPose.benefits || selectedPose.description) && (
                  <div style={{ background: "#E1F5EE", borderRadius: "12px", padding: "0.85rem 1rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#0F6E56", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.05em" }}>✨ Benefits</div>
                    <p style={{ fontSize: "0.82rem", color: "#0F6E56", lineHeight: 1.6 }}>{selectedPose.benefits || selectedPose.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", padding: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
          IRA Yoga Studio · Your personal yoga journey
        </p>
      </div>
    </>
  );
}
