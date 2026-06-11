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

const MOODS = [
  { emoji: "😔", label: "Tough" },
  { emoji: "😐", label: "Okay" },
  { emoji: "🙂", label: "Good" },
  { emoji: "😊", label: "Great" },
  { emoji: "🤩", label: "Amazing" },
];

const QUOTES = [
  "Every breath is a fresh start. 🌿",
  "You showed up. That's everything. 🙏",
  "Your body thanks you for today. ✨",
  "Consistency is your superpower. 💪",
  "Peace begins on the mat. 🧘",
  "Small steps, big transformation. 🌱",
  "Breathe in courage, breathe out fear. 🌊",
  "Your mat is your sanctuary. 🕉️",
];

export default function StudentDashboard() {
  const [student, setStudent]             = useState(null);
  const [clientData, setClientData]       = useState(null);
  const [sequences, setSequences]         = useState([]);
  const [attendance, setAttendance]       = useState({});
  const [loading, setLoading]             = useState(true);
  const [moodMap, setMoodMap]             = useState({});
  const [selectedPose, setSelectedPose]   = useState(null);
  const [expandedCycle, setExpandedCycle] = useState(null);
  const [studentNotes, setStudentNotes]   = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [activeTab, setActiveTab]         = useState("plan");
  const [moodDay, setMoodDay]             = useState(null);
  const router = useRouter();

  useEffect(() => {
    const studentId   = localStorage.getItem("studentId");
    const studentName = localStorage.getItem("studentName");
    if (!studentId) { router.push("/student"); return; }
    setStudent({ id: studentId, name: studentName });
    fetch(`/api/clients/${studentId}`)
      .then(r => r.json())
      .then(data => {
        setClientData(data);
        if (data?.sequences) {
          setSequences(data.sequences);
          const current = data.sequences.find(s => getPlanStatus(s) === "active");
          if (current) loadAttendance(studentId, current.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    setMoodMap(JSON.parse(localStorage.getItem("moodMap") || "{}"));
    fetch("/api/payments?clientId=" + studentId)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMyPayments(data); });
    fetch("/api/session-notes?clientId=" + studentId)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudentNotes(data);
          setUnreadCount(data.filter(n => !n.isRead).length);
        }
      });

  }, []);

  async function loadAttendance(clientId, sequenceId) {
    const res = await fetch(`/api/attendance?clientId=${clientId}&sequenceId=${sequenceId}`);
    const records = await res.json();
    const map = {};
    records.forEach(r => { map[r.day] = r.attended; });
    setAttendance(map);
  }

  async function toggleDay(sequenceId, day) {
    const newVal = !attendance[day];
    setAttendance(prev => ({ ...prev, [day]: newVal }));
    if (newVal) setMoodDay(day);
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: student.id, sequenceId, day, attended: newVal }),
    });
  }

  function saveMood(day, mood) {
    const updated = { ...moodMap, [day]: mood };
    setMoodMap(updated);
    localStorage.setItem("moodMap", JSON.stringify(updated));
    setMoodDay(null);
  }

  function handleLogout() {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    router.push("/student");
  }

  function handlePrint(seq) {
    exportSequencePDF({ name: student.name }, { ...seq }, seq.asanaCount || 6);
  }

  function fmt(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }
  function fmtShort(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  }
  function getPlanDates(seq) {
    const start = new Date(seq.createdAt);
    const end = new Date(start);
    end.setDate(end.getDate() + 9);
    return { start, end };
  }
  function getPlanStatus(seq) {
    return new Date() <= getPlanDates(seq).end ? "active" : "completed";
  }
  function getDaysLeft(seq) {
    return Math.max(0, Math.ceil((getPlanDates(seq).end - new Date()) / 86400000));
  }
  function getStreak() {
    let s = 0;
    for (let i = 1; i <= 10; i++) { if (attendance[i]) s++; else break; }
    return s;
  }
  function getTodayDay(seq) {
    const diff = Math.floor((new Date() - new Date(seq.createdAt)) / 86400000);
    return Math.min(diff + 1, 10);
  }
  function getPoses(seq) {
    try {
      const d = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      return d?.phases?.find(p => p.phase === "Asanas")?.poses || [];
    } catch { return []; }
  }
  function getWarmupPoses(seq) {
    try {
      const d = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      const wp = d?.phases?.find(p => p.phase === "Warm-up")?.poses || [];
      return wp.filter(p => !p.name?.toLowerCase().includes("surya") && !p.name?.toLowerCase().includes("sun salutation"));
    } catch { return []; }
  }
  function getPranayamaPoses(seq) {
    try {
      const d = typeof seq.poses === "string" ? JSON.parse(seq.poses) : seq.poses;
      return d?.phases?.find(p => p.phase === "Pranayama")?.poses || [];
    } catch { return []; }
  }
  function showSurya(seq) {
    if (!clientData) return false;
    const severe = ["High Blood Pressure", "Heart Condition", "Slipped Disk"];
    const all = [
      ...(Array.isArray(clientData.conditions) ? clientData.conditions : (clientData.conditions || "").split(",").filter(Boolean)),
      ...(Array.isArray(clientData.injuries) ? clientData.injuries : (clientData.injuries || "").split(",").filter(Boolean)),
    ];
    return !all.some(c => severe.includes(c)) && !(clientData.experience === "beginner" && (seq.cycleNumber || 1) === 1);
  }
  function handleDownloadCertificate() {
    const name = student?.name || "Student";
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Certificate</title>
    <style>body{font-family:serif;text-align:center;padding:60px;background:#f0f7f4;}.cert{background:white;border:8px solid #1D9E75;border-radius:24px;padding:60px;max-width:700px;margin:0 auto;}h1{color:#1D9E75;font-size:2.5rem;}h2{color:#C17F3A;font-size:1.8rem;margin:1rem 0;}p{color:#555;font-size:1.1rem;line-height:1.8;}.om{font-size:4rem;color:#1D9E75;}</style></head>
    <body onload="window.print()"><div class="cert"><div class="om">ॐ</div><h1>Certificate of Completion</h1><p>This is to certify that</p><h2>${name}</h2><p>has successfully completed a <strong>10-Day Yoga Practice Cycle</strong> with dedication, consistency, and mindfulness.</p><p style="font-style:italic;color:#1D9E75;margin-top:1.5rem;">"Yogaḥ citta-vṛtti nirodhaḥ"</p><div style="font-size:0.9rem;color:#999;margin-top:2rem;">Completed on ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div><div style="font-size:1rem;font-weight:bold;color:#1D9E75;margin-top:1rem;">🧘 Indira Yoga Studio</div></div></body></html>`);
    win.document.close();
  }

  const currentPlan   = sequences.find(s => getPlanStatus(s) === "active");
  const pastPlans     = sequences.filter(s => getPlanStatus(s) === "completed");
  const attendedCount = Object.values(attendance).filter(Boolean).length;
  const streak        = getStreak();
  const daysLeft      = currentPlan ? getDaysLeft(currentPlan) : 0;
  const todayDay      = currentPlan ? getTodayDay(currentPlan) : 0;
  const quote         = QUOTES[new Date().getDay() % QUOTES.length];
  const today         = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" });

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0a2a1f,#1D9E75)" }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</div>
        <p style={{ opacity: 0.8, fontFamily: "serif", fontSize: "1.1rem" }}>Loading your practice...</p>
      </div>
    </div>
  );

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#F2EDE6;}
    .ya{font-family:'DM Sans',sans-serif;min-height:100vh;background:#F2EDE6;}

    /* Header */
    .yh{background:linear-gradient(135deg,#0a2a1f 0%,#1a6b49 60%,#2d9e6e 100%);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);}
    .yh-l{display:flex;align-items:center;gap:1rem;}
    .yh-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1));display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;color:white;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.2);}
    .yh-name{font-family:'Playfair Display',serif;font-size:1.2rem;color:white;font-weight:700;letter-spacing:0.01em;}
    .yh-sub{font-size:0.72rem;color:rgba(255,255,255,0.6);margin-top:2px;}
    .yh-date{font-size:0.7rem;color:rgba(255,255,255,0.5);margin-top:1px;}
    .yh-out{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:7px 18px;border-radius:20px;cursor:pointer;font-size:0.78rem;font-family:'DM Sans',sans-serif;transition:all 0.2s;letter-spacing:0.02em;}
    .yh-out:hover{background:rgba(255,255,255,0.2);}

    /* Tabs */
    .yt{background:white;display:flex;border-bottom:2px solid #EAE4DC;position:sticky;top:0;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,0.08);}
    .yt-btn{flex:1;padding:1rem 0.5rem;border:none;background:transparent;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:500;color:#aaa;cursor:pointer;border-bottom:3px solid transparent;transition:all 0.25s;display:flex;flex-direction:column;align-items:center;gap:3px;margin-bottom:-2px;}
    .yt-btn .ti{font-size:1.2rem;}
    .yt-btn.on{color:#1D9E75;border-bottom-color:#1D9E75;font-weight:700;background:linear-gradient(180deg,transparent,rgba(29,158,117,0.04));}

    /* Content */
    .yc{width:100%;max-width:1400px;margin:0 auto;padding:1.75rem 2.5rem;}

    /* Grid layouts */
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start;}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.25rem;align-items:start;}
    .gfull{grid-column:1/-1;}

    /* Cards */
    .vc{background:white;border-radius:24px;padding:1.5rem;box-shadow:0 4px 24px rgba(0,0,0,0.06);margin-bottom:1.25rem;border:1px solid rgba(0,0,0,0.04);}
    .vc-warm{background:linear-gradient(135deg,#FFFBF5,#FFF7ED);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;border:1.5px solid #FDDCAA;}
    .vc-green{background:linear-gradient(135deg,#F0FAF4,#E8F5E0);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:1.5px solid #B8E0C8;}
    .vc-amber{background:linear-gradient(135deg,#FFFBF0,#FFF8E6);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:2px solid #F59E0B;}
    .vc-indigo{background:linear-gradient(135deg,#F8F7FF,#F0EEFF);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:1.5px solid #C4B5FD;}
    .vc-dark{background:linear-gradient(135deg,#0a2a1f,#1a6b49);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;color:white;}
    .vc-gold{background:linear-gradient(135deg,#7C5A2A,#C17F3A,#E8A84A);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;color:white;}

    /* Stats */
    .ys{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.25rem;}
    .ys-c{background:white;border-radius:20px;padding:1.25rem 0.75rem;text-align:center;border:1px solid #EAE4DC;box-shadow:0 2px 12px rgba(0,0,0,0.05);transition:transform 0.2s;}
    .ys-c:hover{transform:translateY(-2px);}
    .ys-n{font-size:2.2rem;font-weight:800;color:#1D9E75;font-family:'Playfair Display',serif;line-height:1;}
    .ys-l{font-size:0.62rem;color:#aaa;font-weight:600;margin-top:5px;text-transform:uppercase;letter-spacing:0.08em;}

    /* Progress bar */
    .yp{height:10px;background:#EAE4DC;border-radius:999px;overflow:hidden;}
    .yp-f{height:100%;border-radius:999px;background:linear-gradient(90deg,#1D9E75,#4CC9A0,#88E0C0);transition:width 0.8s cubic-bezier(0.4,0,0.2,1);}

    /* Day strip */
    .yds{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-bottom:1rem;}
    .yd{background:#F0EBE3;border-radius:8px;padding:5px 2px;text-align:center;font-size:0.58rem;color:#aaa;font-weight:600;transition:all 0.2s;}
    .yd.yd-done{background:#C8E8D0;color:#0F6E56;}
    .yd.yd-now{background:linear-gradient(135deg,#1D9E75,#4CC9A0);color:white;box-shadow:0 2px 8px rgba(29,158,117,0.4);}

    /* Warmup tags */
    .wt{display:inline-flex;align-items:center;background:linear-gradient(135deg,#FFF7ED,#FFFBF5);color:#92400E;font-size:0.72rem;padding:5px 12px;border-radius:20px;margin:3px;border:1px solid #FDDCAA;font-weight:500;transition:all 0.15s;}
    .wt:hover{background:#FFF0D6;transform:translateY(-1px);}

    /* Session step header */
    .ssh{display:flex;align-items:center;gap:12px;padding:0.9rem 1.1rem;border-radius:16px;margin-bottom:1rem;}
    .ssn{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:800;color:white;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.2);}

    /* Pose grid */
    .pg{display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;}
    .pc{background:white;border-radius:16px;overflow:hidden;border:1px solid #EAE4DC;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .pc:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.12);border-color:#B8E0C8;}
    .pc:active{transform:scale(0.97);}
    .pi{width:100%;height:85px;object-fit:contain;background:linear-gradient(135deg,#FAFAF8,#F5F5F2);display:block;}
    .pni{width:100%;height:85px;background:linear-gradient(135deg,#F3F4F6,#E9EAF0);display:flex;align-items:center;justify-content:center;font-size:1.8rem;}
    .pb{padding:0.5rem 0.65rem 0.6rem;}
    .ps{font-size:0.64rem;font-weight:700;color:#C0392B;margin-bottom:1px;line-height:1.3;}
    .pn{font-size:0.58rem;color:#aaa;font-style:italic;}
    .pnum{font-size:0.55rem;font-weight:800;color:#1D9E75;margin-bottom:2px;}

    /* Pranayama */
    .pr{display:flex;align-items:center;gap:0.85rem;padding:0.75rem 0;border-bottom:1px solid #F0EBE3;}
    .pr:last-child{border-bottom:none;}
    .prd{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#6366F1,#818CF8);flex-shrink:0;box-shadow:0 2px 4px rgba(99,102,241,0.3);}

    /* Attendance grid */
    .ag{display:grid;grid-template-columns:repeat(5,1fr);gap:0.75rem;}
    .adb{background:white;border:2px solid #EAE4DC;border-radius:18px;padding:0.85rem 0.4rem;cursor:pointer;text-align:center;transition:all 0.25s;font-family:'DM Sans',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .adb:active{transform:scale(0.94);}
    .adb.adone{background:linear-gradient(135deg,#1D9E75,#2DB887);border-color:#1D9E75;box-shadow:0 4px 16px rgba(29,158,117,0.3);}
    .adb.atoday{border-color:#F59E0B;box-shadow:0 0 0 3px rgba(245,158,11,0.2);}
    .ade{font-size:1.2rem;}
    .adn{font-size:0.62rem;font-weight:700;color:#6b7280;margin-top:3px;}
    .adb.adone .adn{color:white;}
    .add{font-size:0.56rem;color:#aaa;margin-top:1px;}
    .adb.adone .add{color:rgba(255,255,255,0.8);}

    /* Mood sheet */
    .mo{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:200;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(6px);}
    .ms{background:white;border-radius:28px 28px 0 0;padding:2rem 1.5rem 3rem;width:100%;max-width:520px;animation:sUp 0.35s cubic-bezier(0.4,0,0.2,1);}
    @keyframes sUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
    .mr{display:flex;justify-content:space-around;margin-top:1.25rem;}
    .mb{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:2.5px solid transparent;border-radius:16px;padding:12px 16px;cursor:pointer;transition:all 0.2s;font-family:'DM Sans',sans-serif;}
    .mb:hover{background:#F5F0EA;border-color:#EAE4DC;transform:translateY(-2px);}
    .mb.mp{background:#E8F5E0;border-color:#1D9E75;}
    .me{font-size:2.2rem;}
    .ml{font-size:0.68rem;font-weight:600;color:#6b7280;}

    /* Pose popup */
    .po{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(8px);}
    .pp{background:white;border-radius:28px;max-width:480px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 80px rgba(0,0,0,0.3);animation:pIn 0.25s cubic-bezier(0.4,0,0.2,1);}
    @keyframes pIn{from{opacity:0;transform:scale(0.92)translateY(20px);}to{opacity:1;transform:scale(1)translateY(0);}}
    .ppi{width:100%;height:230px;object-fit:contain;background:linear-gradient(135deg,#F9FAFB,#F0F5F2);border-radius:28px 28px 0 0;}
    .ppb{padding:1.5rem;}
    .badge{font-size:0.72rem;font-weight:700;padding:4px 12px;border-radius:999px;display:inline-block;margin-right:5px;margin-bottom:5px;}
    .bg{background:#E1F5EE;color:#1D9E75;}
    .bi{background:#EEF2FF;color:#3730A3;}
    .br{background:#FEF2F2;color:#DC2626;}

    /* History */
    .hc{background:white;border-radius:20px;overflow:hidden;margin-bottom:1rem;border:1px solid #EAE4DC;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
    .hh{padding:1.1rem 1.35rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:background 0.2s;}
    .hh:hover{background:#FAFAF8;}
    .hb{padding:1.1rem 1.35rem;border-top:1px solid #F0EBE3;background:#FAFAF8;}

    /* Buttons */
    .btn-p{width:100%;padding:1rem;background:linear-gradient(135deg,#1D9E75,#2DB887);color:white;border:none;border-radius:16px;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;margin-bottom:0.75rem;box-shadow:0 4px 16px rgba(29,158,117,0.3);letter-spacing:0.02em;}
    .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(29,158,117,0.4);}
    .btn-w{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:1rem;background:linear-gradient(135deg,#1ebc4a,#25D366);color:white;border:none;border-radius:16px;font-size:0.9rem;font-weight:700;cursor:pointer;text-decoration:none;font-family:'DM Sans',sans-serif;box-shadow:0 4px 16px rgba(37,211,102,0.3);transition:all 0.2s;}
    .btn-w:hover{transform:translateY(-1px);}
    .btn-cert{background:linear-gradient(135deg,#7C5A2A,#C17F3A,#E8A84A);color:white;border:none;border-radius:16px;padding:1rem 1.5rem;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;width:100%;box-shadow:0 4px 16px rgba(193,127,58,0.3);}

    /* Alert */
    .alert{background:linear-gradient(135deg,#FFFBF0,#FFF8E6);border:2px solid #F59E0B;border-radius:18px;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.85rem;box-shadow:0 4px 16px rgba(245,158,11,0.15);}

    /* Typography helpers */
    .serif{font-family:'Playfair Display',serif;}
    .muted{color:#aaa;}
    .green{color:#1D9E75;}
    .amber{color:#92400E;}

    /* Desktop-only wider pose grid */
    @media(min-width:900px){
      .pg{grid-template-columns:repeat(4,1fr);}
      .pg-hist{grid-template-columns:repeat(5,1fr);}
    }
    @media(min-width:1200px){
      .pg{grid-template-columns:repeat(5,1fr);}
    }

    /* Mobile */
    @media(max-width:768px){
      .yc{padding:1rem;}
      .g2{grid-template-columns:1fr;}
      .g3{grid-template-columns:1fr;}
      .yh{padding:1rem;}
      .pg{grid-template-columns:repeat(3,1fr);}
      .ag{grid-template-columns:repeat(5,1fr);}
    }
    @media(max-width:480px){
      .pg{grid-template-columns:repeat(2,1fr);}
    }
  `;

  return (
    <>
      <style>{CSS}</style>
      <div className="ya">

        {/* ── HEADER ── */}
        <div className="yh">
          <div className="yh-l">
            <img src="/logo.png" alt="logo" style={{ width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(201,168,76,0.4)" }} />
            <div>
              <div className="yh-name">{student?.name}</div>
              <div className="yh-sub">{currentPlan ? `Cycle ${currentPlan.cycleNumber} · ${currentPlan.style} · ${currentPlan.duration} min` : "Indira Yoga Studio"}</div>
              <div className="yh-date">{today}</div>
            </div>
          </div>
          <button className="yh-out" onClick={handleLogout}>Logout</button>
        </div>

        {/* ── TABS ── */}
        <div className="yt">
          {[
            { id: "plan",     icon: "🏠", label: "My Plan" },
            { id: "practice", icon: "🧘", label: "Practice" },
            { id: "attend",   icon: "📅", label: "Attendance" },
            { id: "history",  icon: "📚", label: "History" },
            { id: "notes",    icon: "📝", label: unreadCount > 0 ? `Notes 🔴${unreadCount}` : "Notes" },
          ].map(t => (
            <button key={t.id} className={`yt-btn ${activeTab === t.id ? "on" : ""}`} onClick={() => setActiveTab(t.id)}>
              <span className="ti">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div className="yc">

          {/* Renewal alert */}
          {currentPlan && daysLeft <= 3 && daysLeft > 0 && (
            <div className="alert">
              <span style={{ fontSize: "1.4rem" }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#92400E" }}>Plan expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}!</div>
                <div style={{ fontSize: "0.78rem", color: "#B45309" }}>Contact your instructor to renew your cycle.</div>
              </div>
            </div>
          )}

          {/* ══════════ MY PLAN ══════════ */}
          {activeTab === "plan" && (
            <>
              {currentPlan ? (
                <>
                  {/* Quote banner */}
                  <div className="vc-dark" style={{ textAlign: "center", padding: "1.5rem" }}>
                    <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>🕉️</div>
                    <div className="serif" style={{ fontSize: "1rem", color: "rgba(255,255,255,0.9)", fontStyle: "italic", lineHeight: 1.6 }}>{quote}</div>
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>Indira Yoga Studio · Your personal journey</div>
                  </div>

                  {/* Stats */}
                  <div className="ys">
                    <div className="ys-c">
                      <div className="ys-n">🔥{streak}</div>
                      <div className="ys-l">Day Streak</div>
                    </div>
                    <div className="ys-c">
                      <div className="ys-n">{attendedCount}</div>
                      <div className="ys-l">Days Done</div>
                    </div>
                    <div className="ys-c">
                      <div className="ys-n">{daysLeft}</div>
                      <div className="ys-l">Days Left</div>
                    </div>
                  </div>

                  {/* Two column */}
                  <div className="g2">
                    {/* LEFT — Cycle + day strip + progress */}
                    <div>
                      <div className="vc">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.1rem" }}>
                          <div>
                            <div className="serif" style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1a2018", marginBottom: "3px" }}>
                              Cycle {currentPlan.cycleNumber} — {currentPlan.style}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#aaa" }}>
                              {fmt(getPlanDates(currentPlan).start)} — {fmt(getPlanDates(currentPlan).end)}
                            </div>
                          </div>
                          <span style={{ background: "linear-gradient(135deg,#E1F5EE,#C8E8D0)", color: "#0F6E56", fontSize: "0.72rem", fontWeight: 700, padding: "5px 14px", borderRadius: "20px", border: "1px solid #B8E0C8" }}>🟢 Active</span>
                        </div>

                        {/* Day strip */}
                        <div className="yds">
                          {Array.from({ length: 10 }, (_, i) => {
                            const day = i + 1;
                            const d = new Date(getPlanDates(currentPlan).start);
                            d.setDate(d.getDate() + i);
                            return (
                              <div key={day} className={`yd ${day === todayDay ? "yd-now" : attendance[day] ? "yd-done" : ""}`}>
                                <div style={{ fontWeight: 700 }}>{day}</div>
                                <div>{fmtShort(d)}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Progress */}
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#aaa", marginBottom: "7px" }}>
                          <span>Your Progress</span><span style={{ fontWeight: 700, color: "#1D9E75" }}>{attendedCount}/10 days</span>
                        </div>
                        <div className="yp"><div className="yp-f" style={{ width: `${attendedCount * 10}%` }} /></div>
                        <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "6px", fontStyle: "italic" }}>
                          {attendedCount === 0 ? "Start your journey today! 🌱" :
                           attendedCount < 5 ? "Great start! Keep going 💪" :
                           attendedCount < 10 ? "More than halfway there! 🌟" :
                           "Perfect attendance! 🏆"}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT — Goal + mood + actions */}
                    <div>
                      <div className="vc-warm">
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.1rem" }}>
                          <div>
                            <div style={{ fontSize: "0.62rem", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>🎯 Your Goal</div>
                            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a2018", lineHeight: 1.3 }}>{currentPlan.goal || "General Wellness"}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "0.62rem", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>💪 Level</div>
                            <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1a2018", textTransform: "capitalize" }}>{clientData?.experience || "—"}</div>
                          </div>
                        </div>
                        <div style={{ borderTop: "1px solid #EDE6D8", paddingTop: "1rem" }}>
                          <div style={{ fontSize: "0.62rem", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>😊 Today's Mood</div>
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ fontSize: "2.2rem", cursor: "pointer", transition: "transform 0.2s" }}
                              onClick={() => setMoodDay(todayDay)}
                              onMouseEnter={e => e.target.style.transform = "scale(1.2)"}
                              onMouseLeave={e => e.target.style.transform = "scale(1)"}>
                              {moodMap[todayDay] || "😐"}
                            </div>
                            <div>
                              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#1a2018" }}>
                                {moodMap[todayDay] ? "Mood logged ✓" : "Tap to log your mood"}
                              </div>
                              <div style={{ fontSize: "0.7rem", color: "#aaa" }}>Day {todayDay} of 10</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="vc" style={{ padding: "1.35rem" }}>
                        <div className="serif" style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", color: "#1a2018" }}>Your Toolkit</div>
                        <button className="btn-p" onClick={() => handlePrint(currentPlan)}>🖨️ Print / Download My Plan</button>
                        <a className="btn-w" href={`https://wa.me/917996272792?text=Hi%20Indira%20Yoga%20Studio%2C%20I%20am%20${encodeURIComponent(student?.name || "")}%20and%20I%20need%20help.`} target="_blank" rel="noopener noreferrer">
                          <span>💬</span> Contact Instructor on WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="vc" style={{ textAlign: "center", padding: "5rem 2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🌱</div>
                  <div className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>No Active Plan Yet</div>
                  <div style={{ fontSize: "0.9rem", color: "#aaa" }}>Your instructor will create your personalised yoga journey soon.</div>
                </div>
              )}
            </>
          )}

          {/* ══════════ PRACTICE ══════════ */}
          {activeTab === "practice" && (
            <>
              {currentPlan ? (
                <>
                  {/* Session banner */}
                  <div className="vc-dark" style={{ display: "flex", alignItems: "center", gap: "1.25rem", padding: "1.25rem 1.5rem" }}>
                    <div style={{ fontSize: "2.5rem" }}>🌅</div>
                    <div style={{ flex: 1 }}>
                      <div className="serif" style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>
                        Day {todayDay} · Today's Session
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.65)", marginTop: "3px" }}>
                        {currentPlan.duration} min · {currentPlan.style} · Follow the flow below
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Attendance</div>
                      <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "white" }}>{attendedCount}/10</div>
                    </div>
                  </div>

                  <div className="g2">
                    {/* LEFT */}
                    <div>
                      {/* Warmup */}
                      {getWarmupPoses(currentPlan).length > 0 && (
                        <div className="vc">
                          <div className="ssh" style={{ background: "linear-gradient(135deg,#FFF7ED,#FFFBF5)" }}>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#F59E0B,#FBBF24)" }}>1</div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#92400E", fontSize: "0.95rem" }}>🔥 Warm-Up</div>
                              <div style={{ fontSize: "0.7rem", color: "#B45309" }}>~15 min · Joint mobilisation & breathing</div>
                            </div>
                          </div>
                          <div>
                            {getWarmupPoses(currentPlan).map((p, i) => (
                              <span key={i} className="wt">{p.name}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Surya */}
                      {showSurya(currentPlan) && (
                        <div className="vc-amber">
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div style={{ fontSize: "2.5rem" }}>🌞</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, color: "#92400E", fontSize: "0.95rem" }}>Surya Namaskar</div>
                              <div style={{ fontSize: "0.75rem", color: "#B45309", marginTop: "3px" }}>
                                Before Asanas · Begin with <strong>12 rounds</strong>, increase gradually
                              </div>
                            </div>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#F59E0B,#FBBF24)" }}>{getWarmupPoses(currentPlan).length > 0 ? 2 : 1}</div>
                          </div>
                        </div>
                      )}

                      {/* Pranayama */}
                      {getPranayamaPoses(currentPlan).length > 0 && (
                        <div className="vc">
                          <div className="ssh" style={{ background: "linear-gradient(135deg,#F5F3FF,#EEF2FF)" }}>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#6366F1,#818CF8)" }}>
                              {(getWarmupPoses(currentPlan).length > 0 ? 1 : 0) + (showSurya(currentPlan) ? 1 : 0) + 2}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#3730A3", fontSize: "0.95rem" }}>🌬️ Pranayama & Relaxation</div>
                              <div style={{ fontSize: "0.7rem", color: "#6366F1" }}>Breathing · Cool down · Savasana</div>
                            </div>
                          </div>
                          {getPranayamaPoses(currentPlan).map((p, i) => (
                            <div key={i} className="pr">
                              <div className="prd" />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#1a2018" }}>{p.name}</div>
                                {p.duration && <div style={{ fontSize: "0.7rem", color: "#aaa" }}>{p.duration}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* RIGHT — Asanas */}
                    <div>
                      {getPoses(currentPlan).length > 0 && (
                        <div className="vc">
                          <div className="ssh" style={{ background: "linear-gradient(135deg,#E8F5E0,#F0FAF4)" }}>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#1D9E75,#4CC9A0)" }}>
                              {(getWarmupPoses(currentPlan).length > 0 ? 1 : 0) + (showSurya(currentPlan) ? 1 : 0) + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#0F6E56", fontSize: "0.95rem" }}>🧘 Asanas</div>
                              <div style={{ fontSize: "0.7rem", color: "#1D9E75" }}>Tap any pose for detailed instructions</div>
                            </div>
                          </div>
                          <div className="pg">
                            {getPoses(currentPlan).map((pose, i) => {
                              const imgSrc = getPoseImage(pose.sanskrit || pose.name);
                              return (
                                <div key={i} className="pc" onClick={() => setSelectedPose(pose)}>
                                  {imgSrc
                                    ? <img className="pi" src={imgSrc} alt={pose.name} onError={e => e.target.style.display = "none"} />
                                    : <div className="pni">🧘</div>
                                  }
                                  <div className="pb">
                                    <div className="pnum">{i + 1}</div>
                                    <div className="ps">{pose.sanskrit || pose.name}</div>
                                    <div className="pn">{pose.name}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "center", padding: "0.5rem 0 1rem", fontSize: "0.82rem", color: "#aaa", fontStyle: "italic", fontFamily: "serif" }}>
                    "The rhythm of the body, the melody of the mind..." 🙏
                  </div>
                </>
              ) : (
                <div className="vc" style={{ textAlign: "center", padding: "5rem 2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🧘</div>
                  <div className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2018" }}>No Active Plan</div>
                  <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "0.5rem" }}>Your instructor will assign your practice soon.</div>
                </div>
              )}
            </>
          )}

          {/* ══════════ ATTENDANCE ══════════ */}
          {activeTab === "attend" && (
            <>
              {currentPlan ? (
                <>
                  {/* Progress banner */}
                  <div className="vc-dark" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.75rem" }}>
                    <div>
                      <div className="serif" style={{ fontSize: "1.1rem", fontWeight: 700, color: "white" }}>Your 10-Day Journey</div>
                      <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.6)", marginTop: "3px" }}>{attendedCount} of 10 days completed</div>
                    </div>
                    <div className="serif" style={{ fontSize: "3rem", fontWeight: 800, color: "#4CC9A0" }}>{Math.round(attendedCount * 10)}%</div>
                  </div>

                  <div className="g2">
                    {/* LEFT — Day tracker */}
                    <div>
                      <div className="vc">
                        <div className="serif" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1.1rem", color: "#1a2018" }}>
                          Tap a day to mark your practice ✨
                        </div>
                        <div className="ag">
                          {Array.from({ length: 10 }, (_, i) => {
                            const day = i + 1;
                            const done = attendance[day];
                            const date = new Date(getPlanDates(currentPlan).start);
                            date.setDate(date.getDate() + i);
                            const isToday = day === todayDay;
                            return (
                              <button key={day} className={`adb ${done ? "adone" : ""} ${isToday && !done ? "atoday" : ""}`} onClick={() => toggleDay(currentPlan.id, day)}>
                                <div className="ade">{done ? "✅" : isToday ? "⭐" : "⬜"}</div>
                                <div className="adn">Day {day}</div>
                                <div className="add">{fmtShort(date)}</div>
                                {moodMap[day] && <div style={{ fontSize: "0.9rem", marginTop: "3px" }}>{moodMap[day]}</div>}
                              </button>
                            );
                          })}
                        </div>
                        <div style={{ marginTop: "1.1rem" }}>
                          <div className="yp"><div className="yp-f" style={{ width: `${attendedCount * 10}%` }} /></div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#aaa", marginTop: "5px" }}>
                            <span>Day 1 · {fmtShort(getPlanDates(currentPlan).start)}</span>
                            <span>Day 10 · {fmtShort(getPlanDates(currentPlan).end)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT — Mood journal + tips */}
                    <div>
                      <div className="vc-warm">
                        <div className="serif" style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "1rem", color: "#1a2018" }}>😊 Your Mood Journal</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "0.6rem" }}>
                          {Array.from({ length: 10 }, (_, i) => {
                            const day = i + 1;
                            const mood = moodMap[day];
                            const done = attendance[day];
                            return (
                              <div key={day} onClick={() => done && setMoodDay(day)}
                                style={{ background: "white", borderRadius: "14px", padding: "0.65rem 0.4rem", border: `1.5px solid ${done ? "#FDDCAA" : "#EAE4DC"}`, textAlign: "center", cursor: done ? "pointer" : "default", opacity: done ? 1 : 0.4, transition: "all 0.2s", boxShadow: done ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
                                <div style={{ fontSize: "1.3rem" }}>{mood || (done ? "😐" : "—")}</div>
                                <div style={{ fontSize: "0.58rem", color: "#aaa", fontWeight: 600, marginTop: "3px" }}>Day {day}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "0.85rem", fontStyle: "italic", textAlign: "center" }}>
                          Tap a completed day to update your mood
                        </div>
                      </div>

                      {attendedCount === 10 ? (
                        <div className="vc-gold" style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🏆</div>
                          <div className="serif" style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                            Perfect! All 10 Days Done!
                          </div>
                          <div style={{ fontSize: "0.82rem", opacity: 0.85, marginBottom: "1.25rem" }}>
                            Incredible dedication. Your practice has transformed you.
                          </div>
                          <button className="btn-cert" onClick={handleDownloadCertificate}>🏆 Download Your Certificate</button>
                        </div>
                      ) : (
                        <div className="vc-indigo">
                          <div className="serif" style={{ fontSize: "1rem", fontWeight: 700, color: "#3730A3", marginBottom: "1rem" }}>💡 Practice Tips</div>
                          {[
                            "Practice at the same time each day",
                            "Even 20 minutes counts — mark your day",
                            "Log your mood to track your journey",
                            "Consistency matters more than perfection",
                            "Your mat is always waiting for you 🧘",
                          ].map((tip, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.6rem", fontSize: "0.84rem", color: "#4338CA", alignItems: "flex-start" }}>
                              <span style={{ color: "#818CF8", marginTop: "1px", flexShrink: 0 }}>✦</span>{tip}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="vc" style={{ textAlign: "center", padding: "5rem 2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📅</div>
                  <div className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2018" }}>Nothing to track yet</div>
                  <div style={{ fontSize: "0.9rem", color: "#aaa", marginTop: "0.5rem" }}>Your attendance will appear once your plan starts.</div>
                </div>
              )}
            </>
          )}

          {/* ══════════ HISTORY ══════════ */}
          {activeTab === "history" && (
            <>
              {pastPlans.length === 0 ? (
                <div className="vc" style={{ textAlign: "center", padding: "5rem 2rem" }}>
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📚</div>
                  <div className="serif" style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>No Past Cycles Yet</div>
                  <div style={{ fontSize: "0.9rem", color: "#aaa" }}>Your completed journeys will be celebrated here.</div>
                </div>
              ) : (
                <div className="g2">
                  {pastPlans.map(seq => (
                    <div key={seq.id} className="hc">
                      <div className="hh" onClick={() => setExpandedCycle(expandedCycle === seq.id ? null : seq.id)}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#1a2018" }}>Cycle {seq.cycleNumber} — {seq.style}</div>
                          <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "3px" }}>
                            {fmt(getPlanDates(seq).start)} — {fmt(getPlanDates(seq).end)} · {seq.goal}
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <button onClick={e => { e.stopPropagation(); handlePrint(seq); }}
                            style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "6px 14px", fontSize: "0.75rem", cursor: "pointer", color: "#374151", fontFamily: "'DM Sans',sans-serif" }}>
                            🖨️ Print
                          </button>
                          <span style={{ color: "#aaa", fontSize: "1rem" }}>{expandedCycle === seq.id ? "▲" : "▼"}</span>
                        </div>
                      </div>
                      {expandedCycle === seq.id && (
                        <div className="hb">
                          {getWarmupPoses(seq).length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#92400E", marginBottom: "0.5rem" }}>🔥 Warm-up</div>
                              <div>{getWarmupPoses(seq).map((p, i) => <span key={i} className="wt">{p.name}</span>)}</div>
                            </div>
                          )}
                          {getPoses(seq).length > 0 && (
                            <div style={{ marginBottom: "1rem" }}>
                              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#0F6E56", marginBottom: "0.75rem" }}>🧘 Asanas</div>
                              <div className="pg pg-hist">
                                {getPoses(seq).map((pose, i) => {
                                  const imgSrc = getPoseImage(pose.sanskrit || pose.name);
                                  return (
                                    <div key={i} className="pc" onClick={() => setSelectedPose(pose)}>
                                      {imgSrc
                                        ? <img className="pi" src={imgSrc} alt={pose.name} style={{ height: "70px" }} />
                                        : <div className="pni" style={{ height: "70px" }}>🧘</div>
                                      }
                                      <div className="pb">
                                        <div className="ps">{pose.sanskrit || pose.name}</div>
                                        <div className="pn">{pose.name}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {getPranayamaPoses(seq).length > 0 && (
                            <div>
                              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#3730A3", marginBottom: "0.5rem" }}>🌬️ Pranayama</div>
                              {getPranayamaPoses(seq).map((p, i) => (
                                <div key={i} className="pr">
                                  <div className="prd" />
                                  <div style={{ fontSize: "0.84rem", color: "#374151" }}>{p.name}{p.duration ? " — " + p.duration : ""}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {activeTab === "notes" && (
            <div>
              {studentNotes.length === 0 ? (
                <div className="vc" style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                  <div className="serif" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1a2018", marginBottom: "0.5rem" }}>No Notes Yet</div>
                  <div style={{ fontSize: "0.85rem", color: "#aaa" }}>Your instructor will add progress notes here after your sessions.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {studentNotes.map(n => (
                    <div key={n.id} className="vc" style={{ padding: "1.25rem 1.5rem", cursor: "pointer" }}
                      onClick={async () => {
                        if (!n.isRead) {
                          await fetch("/api/session-notes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
                          setStudentNotes(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
                          setUnreadCount(prev => Math.max(0, prev - 1));
                        }
                      }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ background: "#E1F5EE", color: "#0F6E56", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>Cycle {n.cycleNumber}</span>
                          <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        {!n.isRead && <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>🔴 NEW</span>}
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{n.note}</p>
                      <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "0.75rem", fontStyle: "italic" }}>— Your Instructor, Indira Yoga Studio</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


        </div>

        {/* ── MOOD SHEET ── */}
        {moodDay && (
          <div className="mo" onClick={() => setMoodDay(null)}>
            <div className="ms" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: "center", marginBottom: "0.75rem" }}>
                <div style={{ width: "40px", height: "4px", background: "#E5E7EB", borderRadius: "2px", margin: "0 auto 1.25rem" }} />
                <div className="serif" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a2018" }}>How did your practice feel?</div>
                <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "5px" }}>Day {moodDay} of your journey</div>
              </div>
              <div className="mr">
                {MOODS.map((m, i) => (
                  <button key={i} className={`mb ${moodMap[moodDay] === m.emoji ? "mp" : ""}`} onClick={() => saveMood(moodDay, m.emoji)}>
                    <span className="me">{m.emoji}</span>
                    <span className="ml">{m.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button onClick={() => setMoodDay(null)} style={{ background: "none", border: "none", color: "#aaa", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>
                  Skip for now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── POSE POPUP ── */}
        {selectedPose && (
          <div className="po" onClick={() => setSelectedPose(null)}>
            <div className="pp" onClick={e => e.stopPropagation()}>
              {getPoseImage(selectedPose.sanskrit || selectedPose.name)
                ? <img className="ppi" src={getPoseImage(selectedPose.sanskrit || selectedPose.name)} alt={selectedPose.name} />
                : <div style={{ width: "100%", height: "230px", background: "linear-gradient(135deg,#F3F4F6,#E9EAF0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem", borderRadius: "28px 28px 0 0" }}>🧘</div>
              }
              <div className="ppb">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1rem" }}>
                  <div style={{ flex: 1 }}>
                    <h2 className="serif" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#C0392B", marginBottom: "3px" }}>
                      {selectedPose.sanskrit || selectedPose.name}
                    </h2>
                    <p style={{ fontSize: "0.8rem", color: "#aaa", fontStyle: "italic" }}>{selectedPose.name}</p>
                    {selectedPose.duration && <p style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "3px" }}>⏱ {selectedPose.duration}</p>}
                    <div style={{ marginTop: "8px" }}>
                      {(() => {
                        const r = getPoseReps(selectedPose, currentPlan?.cycleNumber || 1);
                        return (
                          <>
                            {r.reps && <span className="badge bg">🔁 {r.reps}</span>}
                            <span className="badge bi">🌬 Hold {r.hold}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  <button onClick={() => setSelectedPose(null)}
                    style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "1rem" }}>✕</button>
                </div>

                {selectedPose.cues && (
                  <div style={{ background: "#F9FAFB", borderRadius: "16px", padding: "1rem 1.1rem", marginBottom: "0.85rem" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#1a2018", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>📋 How to do it</div>
                    <ol style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                      {String(Array.isArray(selectedPose.cues) ? selectedPose.cues.join(". ") : (selectedPose.cues || "")).split(".").filter(s => s.trim()).map((step, i) => (
                        <li key={i} style={{ fontSize: "0.85rem", color: "#374151", lineHeight: 1.65 }}>{step.trim()}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {(selectedPose.benefits || selectedPose.description) && (
                  <div style={{ background: "linear-gradient(135deg,#E8F5E0,#F0FAF4)", borderRadius: "16px", padding: "1rem 1.1rem" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#0F6E56", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>✨ Benefits</div>
                    <p style={{ fontSize: "0.85rem", color: "#0F6E56", lineHeight: 1.65 }}>{selectedPose.benefits || selectedPose.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#C8BFB0", padding: "2rem 1rem 1.5rem", fontFamily: "serif", fontStyle: "italic" }}>
          Indira Yoga Studio · Your personal yoga journey 🌿
        </p>

      </div>
    </>
  );
}
