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
    if (newVal) { setShowMood(true); }
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
      const wp = data?.phases?.find(p => p.phase === "Warm-up")?.poses || [];
      return wp.filter(p => !p.name?.toLowerCase().includes("surya") && !p.name?.toLowerCase().includes("sun salutation"));
    } catch { return []; }
  }

  function getPranayamaPoses(seq) {
    try {
      const data = typeof seq.poses === 'string' ? JSON.parse(seq.poses) : seq.poses;
      return data?.phases?.find(p => p.phase === 'Pranayama')?.poses || [];
    } catch { return []; }
  }

  function getPranayamaPoses(seq) {
    try {
      const data = typeof seq.poses === 'string' ? JSON.parse(seq.poses) : seq.poses;
      return data?.phases?.find(p => p.phase === 'Pranayama')?.poses || [];
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
  const levelColor = { beginner: "#1D9E75", intermediate: "#F59E0B", advanced: "#DC2626" };
  const levelBg = { beginner: "#E1F5EE", intermediate: "#FFFBEB", advanced: "#FEF2F2" };




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

        {/* Renewal Alert */}
        {currentPlan && daysLeft <= 3 && daysLeft > 0 && (
          <div style={{ background: "#FFF7ED", border: "1px solid #F59E0B", borderRadius: "12px", padding: "0.85rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.3rem" }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#92400E" }}>Plan expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}!</div>
              <div style={{ fontSize: "0.8rem", color: "#B45309" }}>Contact your instructor to renew your cycle.</div>
            </div>
          </div>
        )}

        {/* Streak + Mood Row */}
        {currentPlan && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ background: "white", borderRadius: "12px", padding: "0.85rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center" }}>
              <div style={{ fontSize: "1.6rem" }}>🔥</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: streak > 0 ? "#F59E0B" : "#9ca3af" }}>{streak}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>Day Streak</div>
            </div>
            <div style={{ background: "white", borderRadius: "12px", padding: "0.85rem 1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", textAlign: "center", cursor: "pointer" }} onClick={() => setShowMood(!showMood)}>
              <div style={{ fontSize: "1.6rem" }}>{moodMap[todayDay] || "😐"}</div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1D9E75" }}>Today's Mood</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Tap to update</div>
            </div>
          </div>
        )}

        {/* Mood Picker */}
        {showMood && currentPlan && (
          <div style={{ background: "white", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" }}>How do you feel after today's practice?</div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
              {MOODS.map((m, i) => (
                <button key={i} onClick={() => saveMood(todayDay, m)}
                  style={{ fontSize: "1.8rem", background: moodMap[todayDay] === m ? "#E1F5EE" : "transparent", border: moodMap[todayDay] === m ? "2px solid #1D9E75" : "2px solid transparent", borderRadius: "10px", padding: "6px", cursor: "pointer" }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

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
              <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: "0.75rem", fontWeight: 600, padding: "4px 10px", borderRadius: "999px" }}>🟢 {daysLeft}d left</span>
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

            {/* Warmup Section */}
            {getWarmupPoses(currentPlan).length > 0 && (
              <div style={{ background: "#FFF7ED", borderRadius: "12px", padding: "1rem", marginBottom: "1rem" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#92400E", marginBottom: "0.5rem" }}>🔥 Warm-up</div>
                <div style={{ fontSize: "0.82rem", color: "#B45309" }}>
                  {getWarmupPoses(currentPlan).map(p => p.name).join(" · ")}
                </div>
              </div>
            )}

            {/* Surya Namaskar Banner */}
            {showSuryaBanner(currentPlan) && (
              <div style={{ background: "linear-gradient(135deg, #FFF7ED, #FFFBEB)", border: "1.5px solid #F59E0B", borderRadius: "12px", padding: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ fontSize: "2rem" }}>🌅</div>
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#92400E", marginBottom: "3px" }}>Surya Namaskar — Before Asanas</div>
                  <div style={{ fontSize: "0.8rem", color: "#B45309" }}>Practice Surya Namaskar before starting your asanas. Begin with <strong>12 rounds daily</strong> and increase gradually as per your capacity.</div>
                </div>
              </div>
            )}

            {/* Asana Poses */}
            {getPoses(currentPlan).length > 0 && (
              <div style={{ marginBottom: "1.25rem" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2018", marginBottom: "0.75rem" }}>🧘 Your Asanas</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                  {getPoses(currentPlan).map((pose, i) => {
                    const imgSrc = getPoseImage(pose.sanskrit || pose.name, "Asanas");
                    return (
                      <div key={i} onClick={() => setSelectedPose(pose)}
                        style={{ background: "#f9fafb", borderRadius: "12px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer" }}>
                        {imgSrc
                          ? <img src={imgSrc} alt={pose.name} style={{ width: "100%", height: "110px", objectFit: "contain", background: "white", display: "block" }} />
                          : <div style={{ width: "100%", height: "110px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🧘</div>
                        }
                        <div style={{ padding: "0.5rem 0.6rem" }}>
                          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1a2018" }}>{pose.name}</div>
                          {pose.duration && <div style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: "2px" }}>⏱ {pose.duration}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Attendance Tracker */}
            <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "1rem", marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a2018" }}>📅 Attendance</div>
                <div style={{ fontSize: "0.8rem", color: "#1D9E75", fontWeight: 600 }}>{attendedCount}/10 days</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem" }}>
                {Array.from({ length: 10 }, (_, i) => {
                  const day = i + 1;
                  const done = attendance[day];
                  const date = new Date(getPlanDates(currentPlan).start);
                  date.setDate(date.getDate() + i);
                  const dateStr = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
                  return (
                    <button key={day} onClick={() => toggleDay(currentPlan.id, day)}
                      style={{ background: done ? "#1D9E75" : "white", border: `2px solid ${done ? "#1D9E75" : "#e5e7eb"}`, borderRadius: "10px", padding: "0.5rem", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                      <div style={{ fontSize: "1rem" }}>{done ? "✅" : "⬜"}</div>
                      <div style={{ fontSize: "0.65rem", fontWeight: 600, color: done ? "white" : "#6b7280", marginTop: "2px" }}>Day {day}</div>
                      <div style={{ fontSize: "0.6rem", color: done ? "rgba(255,255,255,0.8)" : "#9ca3af" }}>{dateStr}</div>
                    </button>
                  );
                })}
              </div>
              {attendedCount === 10 && (
                <div style={{ textAlign: "center", marginTop: "1rem" }}>
                  <div style={{ fontSize: "0.95rem", color: "#1D9E75", fontWeight: 700, marginBottom: "0.5rem" }}>🎉 Amazing! You completed all 10 days!</div>
                  <button onClick={handleDownloadCertificate}
                    style={{ background: "#1D9E75", color: "white", border: "none", borderRadius: "8px", padding: "8px 20px", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}>
                    🏆 Download Certificate
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => handlePrint(currentPlan)} style={{ width: "100%", padding: "0.85rem", background: "#1D9E75", color: "white", border: "none", borderRadius: "10px", fontSize: "1rem", fontWeight: 700, cursor: "pointer", marginBottom: "0.75rem" }}>
              🖨️ Print / Download My Plan
            </button>

            <a href={`https://wa.me/917996272792?text=Hi%20IRA%20Yoga%20Studio%2C%20I%20am%20${encodeURIComponent(student?.name || "")}%20and%20I%20need%20help%20with%20my%20yoga%20plan.`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.75rem", background: "#25D366", color: "white", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
              <span style={{ fontSize: "1.1rem" }}>💬</span> Contact Instructor on WhatsApp
            </a>
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
          <div style={{ background: "white", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1a2018", marginBottom: "1rem" }}>📚 Past Cycles</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {pastPlans.map(seq => (
                <div key={seq.id} style={{ background: "#f9fafb", borderRadius: "10px", overflow: "hidden" }}>
                  <div onClick={() => setExpandedCycle(expandedCycle === seq.id ? null : seq.id)}
                    style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1a2018" }}>Cycle {seq.cycleNumber} — {seq.style}</div>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>
                        {formatDate(getPlanDates(seq).start)} — {formatDate(getPlanDates(seq).end)} · {seq.goal}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <button onClick={e => { e.stopPropagation(); handlePrint(seq); }} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8rem", cursor: "pointer", color: "#374151" }}>
                        🖨️ Print
                      </button>
                      <span style={{ fontSize: "1rem", color: "#6b7280" }}>{expandedCycle === seq.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {expandedCycle === seq.id && (
                    <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "0.75rem" }}>

                      {getWarmupPoses(seq).length > 0 && (
                        <div style={{ background: "#FFF7ED", borderRadius: "10px", padding: "0.75rem" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400E", marginBottom: "4px" }}>🔥 Warm-up</div>
                          <div style={{ fontSize: "0.75rem", color: "#B45309" }}>{getWarmupPoses(seq).map(p => p.name).join(" · ")}</div>
                        </div>
                      )}

                      {showSuryaBanner(seq) && (
                        <div style={{ background: "linear-gradient(135deg, #FFF7ED, #FFFBEB)", border: "1.5px solid #F59E0B", borderRadius: "10px", padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ fontSize: "1.5rem" }}>🌅</div>
                          <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#92400E" }}>Surya Namaskar — Before Asanas</div>
                            <div style={{ fontSize: "0.75rem", color: "#B45309" }}>12 rounds daily, increase gradually.</div>
                          </div>
                        </div>
                      )}

                      {getPoses(seq).length > 0 && (
                        <div>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>🧘 Asanas</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                            {getPoses(seq).map((pose, i) => {
                              const imgSrc = getPoseImage(pose.sanskrit || pose.name, "Asanas");
                              return (
                                <div key={i} onClick={() => setSelectedPose(pose)}
                                  style={{ background: "white", borderRadius: "10px", overflow: "hidden", border: "1px solid #e5e7eb", cursor: "pointer" }}>
                                  {imgSrc
                                    ? <img src={imgSrc} alt={pose.name} style={{ width: "100%", height: "70px", objectFit: "contain", background: "white", display: "block" }} />
                                    : <div style={{ width: "100%", height: "70px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>🧘</div>
                                  }
                                  <div style={{ padding: "0.3rem 0.4rem" }}>
                                    <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "#1a2018", lineHeight: 1.3 }}>{pose.name}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {getPranayamaPoses(seq).length > 0 && (
                        <div style={{ background: "#EEF2FF", borderRadius: "10px", padding: "0.75rem" }}>
                          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#3730A3", marginBottom: "4px" }}>🌬️ Pranayama</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {getPranayamaPoses(seq).map((p, i) => (
                              <div key={i} style={{ fontSize: "0.75rem", color: "#3730A3" }}>• {p.name}{p.duration ? " — " + p.duration : ""}</div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#9ca3af", marginTop: "1rem", marginBottom: "1.5rem" }}>
          IRA Yoga Studio · Contact your instructor for support
        </p>
      </div>

      {/* Pose Detail Popup */}
      {selectedPose && (
        <div onClick={() => setSelectedPose(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "white", borderRadius: "16px", maxWidth: "420px", width: "100%", maxHeight: "85vh", overflow: "auto" }}>
            {getPoseImage(selectedPose.sanskrit || selectedPose.name, "Asanas")
              ? <img src={getPoseImage(selectedPose.sanskrit || selectedPose.name, "Asanas")} alt={selectedPose.name} style={{ width: "100%", height: "200px", objectFit: "contain", background: "#f9fafb", borderRadius: "16px 16px 0 0" }} />
              : <div style={{ width: "100%", height: "200px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4rem", borderRadius: "16px 16px 0 0" }}>🧘</div>
            }
            <div style={{ padding: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#C0392B" }}>{selectedPose.name}</h2>
                  {selectedPose.duration && <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>⏱ {selectedPose.duration}</p>}
                {(() => {
                  const r = getPoseReps(selectedPose, currentPlan?.cycleNumber || 1);
                  return (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {r.reps && <span style={{ background: '#E1F5EE', color: '#1D9E75', fontWeight: 700, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '999px' }}>🔁 {r.reps}</span>}
                      <span style={{ background: '#EEF2FF', color: '#3730A3', fontWeight: 700, fontSize: '0.78rem', padding: '3px 10px', borderRadius: '999px' }}>🌬 Hold {r.hold}</span>
                    </div>
                  );
                })()}
                </div>
                <button onClick={() => setSelectedPose(null)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}>✕</button>
              </div>
              {selectedPose.cues && (
                <div style={{ background: "#f9fafb", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "0.75rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1a2018", marginBottom: "6px" }}>📋 How to do</div>
                  <ol style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                    {String(Array.isArray(selectedPose.cues) ? selectedPose.cues.join(". ") : (selectedPose.cues || "")).split(".").filter(s => s.trim()).map((step, i) => (
                      <li key={i} style={{ fontSize: "0.82rem", color: "#374151", lineHeight: 1.6 }}>
                        {step.trim()}
                        {/(\d+-\d+-?\d*\s*times?)/i.test(step) && (
                          <strong style={{ color: '#1D9E75', marginLeft: '6px' }}>
                            ({step.match(/(\d+-\d+-?\d*\s*times?)/i)?.[1]})
                          </strong>
                        )}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {(selectedPose.benefits || selectedPose.description) && (
                <div style={{ background: "#E1F5EE", borderRadius: "10px", padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0F6E56", marginBottom: "4px" }}>✨ Benefits</div>
                  <p style={{ fontSize: "0.82rem", color: "#0F6E56" }}>{selectedPose.benefits || selectedPose.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
