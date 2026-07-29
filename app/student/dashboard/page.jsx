"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { exportSequencePDF } from "@/lib/pdfExport";
import { getPoseImage } from "@/lib/poseImages";

const NAV_ICON_PATHS = {
  plan:     <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5.5h4V20h3.5a1 1 0 0 0 1-1v-9" /></>,
  practice: <><path d="M12 4c1 2.6 2.6 4 4.7 4.6C15.3 9.4 14 11 12 13.5 10 11 8.7 9.4 7.3 8.6 9.4 8 11 6.6 12 4z" strokeLinejoin="round" /><path d="M12 13.5v6.5" /><path d="M6.5 20c2-1.6 3.7-1.6 5.5 0 1.8-1.6 3.5-1.6 5.5 0" strokeLinejoin="round" /></>,
  attend:   <><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  history:  <><path d="M12 21a9 9 0 1 1 9-9" /><path d="M12 7.5V12l3 2" /><path d="M3.5 9.5 3 5.5l4 1" /></>,
  notes:    <><path d="M6 3.5h9l4.5 4.5V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" strokeLinejoin="round" /><path d="M14.5 3.5V8H19" /><path d="M8 12.5h8M8 16h5" /></>,
  payments: <><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h3" /></>,
};
function NavIcon({ id }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="22" height="22">
      {NAV_ICON_PATHS[id]}
    </svg>
  );
}

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
  const [myPayments, setMyPayments]       = useState([]);
  const [installPrompt, setInstallPrompt]  = useState(null);
  const [showInstall, setShowInstall]      = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showInstallPop, setShowInstallPop] = useState(false);
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

    // Detect if already running as an installed PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsAppInstalled(standalone);

    // PWA install prompt (captured silently; surfaced via the header install button instead of an auto banner)
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

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

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    setShowInstallPop(false);
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') setIsAppInstalled(true);
    setInstallPrompt(null);
  }

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
    w(`<html><head><title>Certificate</title>
    <style>body{font-family:serif;text-align:center;padding:60px;background:#E7ECDA;}.cert{background:white;border:8px solid #3E4A2A;border-radius:24px;padding:60px;max-width:700px;margin:0 auto;}h1{color:#3E4A2A;font-size:2.5rem;}h2{color:#93711F;font-size:1.8rem;margin:1rem 0;}p{color:#555;font-size:1.1rem;line-height:1.8;}.om{font-size:4rem;color:#3E4A2A;}</style></head>
    <body onload="window.print()"><div class="cert"><div class="om">ॐ</div><h1>Certificate of Completion</h1><p>This is to certify that</p><h2>${name}</h2><p>has successfully completed a <strong>10-Day Yoga Practice Cycle</strong> with dedication, consistency, and mindfulness.</p><p style="font-style:italic;color:#3E4A2A;margin-top:1.5rem;">"Yogaḥ citta-vṛtti nirodhaḥ"</p><div style="font-size:0.9rem;color:#999;margin-top:2rem;">Completed on ${new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</div><div style="font-size:1rem;font-weight:bold;color:#3E4A2A;margin-top:1rem;">🧘 Navira Yoga Studio</div></div></body></html>`);
    const html = lines.join('\n');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  const currentPlan   = sequences.find(s => getPlanStatus(s) === "active");
  const pastPlans     = sequences.filter(s => getPlanStatus(s) === "completed");
  const attendedCount = Object.values(attendance).filter(Boolean).length;
  const streak        = getStreak();
  const daysLeft      = currentPlan ? getDaysLeft(currentPlan) : 0;
  const todayDay      = currentPlan ? getTodayDay(currentPlan) : 0;
  const quote         = QUOTES[new Date().getDay() % QUOTES.length];
  const today         = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" });


  function downloadReceipt(p) {
    const receiptNo = 'IYS-' + p.year + '-' + String(p.month).substring(0,3).toUpperCase() + '-' + p.id.substring(0,6).toUpperCase();
    const paidDate = p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '';
    const studentName = student ? student.name : '';
    const lines = [];
    const w = (s) => lines.push(s);
    w('<html><head><title>Receipt</title><style>');
    w('* { margin:0; padding:0; box-sizing:border-box; }');
    w('body { font-family: Georgia, serif; background:#f5f5f5; display:flex; justify-content:center; padding:40px 20px; }');
    w('.receipt { background:white; width:480px; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.12); }');
    w('.header { background:linear-gradient(135deg,#171F10,#3E4A2A); padding:2rem; text-align:center; color:white; }');
    w('.logo { width:70px; height:70px; border-radius:50%; border:3px solid rgba(201,168,76,0.6); margin:0 auto 0.75rem; display:block; }');
    w('.studio-name { font-size:1.4rem; font-weight:800; color:#BE9346; letter-spacing:0.05em; }');
    w('.studio-sub { font-size:0.8rem; color:rgba(255,255,255,0.7); margin-top:4px; }');
    w('.receipt-title { background:#BE9346; color:#171F10; text-align:center; padding:0.6rem; font-size:0.85rem; font-weight:800; letter-spacing:0.15em; text-transform:uppercase; }');
    w('.body { padding:1.75rem; }');
    w('.receipt-no { text-align:right; font-size:0.78rem; color:#9ca3af; margin-bottom:1.25rem; }');
    w('.row { display:flex; justify-content:space-between; padding:0.65rem 0; border-bottom:1px solid #f3f4f6; font-size:0.88rem; }');
    w('.label { color:#6b7280; font-weight:500; }');
    w('.value { color:#1a2018; font-weight:600; }');
    w('.amount-box { background:linear-gradient(135deg,#E7ECDA,#E7ECDA); border:2px solid #3E4A2A; border-radius:10px; padding:1.25rem; text-align:center; margin:1.25rem 0; }');
    w('.amount-label { font-size:0.75rem; color:#6E7460; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:0.4rem; }');
    w('.amount-value { font-size:2.2rem; font-weight:800; color:#3E4A2A; }');
    w('.paid-stamp { background:#3E4A2A; color:white; font-size:1.1rem; font-weight:800; letter-spacing:0.2em; padding:0.5rem 1.5rem; border-radius:6px; display:inline-block; transform:rotate(-3deg); margin:0.5rem 0; }');
    w('.footer { border-top:2px dashed #e5e7eb; padding:1.25rem 1.75rem; text-align:center; }');
    w('.sig-line { border-top:1px solid #1a2018; width:160px; margin:0.5rem auto 0; }');
    w('.sig-label { font-size:0.75rem; color:#6b7280; margin-top:4px; }');
    w('.note { font-size:0.72rem; color:#9ca3af; margin-top:1rem; font-style:italic; }');
    w('</style></head><body onload="window.print()">');
    w('<div class="receipt">');
    w('<div class="header">');
    w('<img src="https://navirayogastudent.vercel.app/logo.png" class="logo" alt="logo" />');
    w('<div class="studio-name">Navira Yoga Studio</div>');
    w('<div class="studio-sub">Therapeutic Yoga · Hatha · Pranayama</div>');
    w('</div>');
    w('<div class="receipt-title">Payment Receipt</div>');
    w('<div class="body">');
    w('<div class="receipt-no">Receipt No: ' + receiptNo + '</div>');
    w('<div class="row"><span class="label">Student Name</span><span class="value">' + studentName + '</span></div>');
    w('<div class="row"><span class="label">Period</span><span class="value">' + p.month + ' ' + p.year + '</span></div>');
    w('<div class="row"><span class="label">Payment Date</span><span class="value">' + paidDate + '</span></div>');
    if (p.notes) w('<div class="row"><span class="label">Description</span><span class="value">' + p.notes + '</span></div>');
    w('<div class="amount-box">');
    w('<div class="amount-label">Amount Paid</div>');
    w('<div class="amount-value">Rs.' + p.amount.toLocaleString() + '</div>');
    w('</div>');
    w('<div style="text-align:center"><span class="paid-stamp">PAID</span></div>');
    w('</div>');
    w('<div class="footer">');
    w('<div class="sig-line"></div>');
    w('<div class="sig-label">Authorized Signature — Navira Yoga Studio</div>');
    w('<div class="note">This is a computer generated receipt. Valid for reimbursement purposes.</div>');
    w('</div></div></body></html>');
    const html = lines.join('\n');
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Receipt-' + receiptNo + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#171F10,#3E4A2A)" }}>
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</div>
        <p style={{ opacity: 0.8, fontFamily: "serif", fontSize: "1.1rem" }}>Loading your practice...</p>
      </div>
    </div>
  );

  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#F2EDE6;}
    .ya{font-family:'Manrope',sans-serif;min-height:100vh;background:#F2EDE6;}

    /* Header */
    .yh{position:sticky;top:0;z-index:150;background:linear-gradient(135deg,#171F10 0%,#2E3820 60%,#3E4A2A 100%);padding:1rem 2rem;display:flex;justify-content:space-between;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,0.3);}
    .yh-l{display:flex;align-items:center;gap:1rem;}
    .yh-r{display:flex;align-items:center;gap:0.6rem;}
    .yh-av{width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,rgba(255,255,255,0.3),rgba(255,255,255,0.1));display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:800;color:white;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.2);}
    .yh-name{font-family:'Fraunces',serif;font-size:1.2rem;color:white;font-weight:700;letter-spacing:0.01em;}
    .yh-sub{font-size:0.72rem;color:rgba(255,255,255,0.6);margin-top:2px;}
    .yh-date{font-size:0.7rem;color:rgba(255,255,255,0.5);margin-top:1px;}
    .yh-out{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:white;padding:7px 18px;border-radius:20px;cursor:pointer;font-size:0.78rem;font-family:'Manrope',sans-serif;transition:all 0.2s;letter-spacing:0.02em;}
    .yh-out:hover{background:rgba(255,255,255,0.2);}
    .yh-install{background:rgba(190,147,70,0.16);border:1px solid rgba(190,147,70,0.45);color:#EFE0BC;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;position:relative;}
    .yh-install:hover{background:rgba(190,147,70,0.3);}
    .yh-install-pop{position:absolute;top:calc(100% + 10px);right:0;background:white;border-radius:14px;padding:1rem 1.1rem;width:230px;box-shadow:0 16px 40px rgba(23,31,16,0.25);z-index:250;text-align:left;}
    .yh-install-pop::before{content:'';position:absolute;top:-6px;right:14px;width:12px;height:12px;background:white;transform:rotate(45deg);}
    .yh-install-pop .t{font-family:'Fraunces',serif;font-weight:700;font-size:0.9rem;color:#171F10;margin-bottom:0.4rem;}
    .yh-install-pop .d{font-size:0.72rem;color:#6E7460;line-height:1.6;}
    .yh-install-pop button.go{margin-top:0.7rem;width:100%;background:#3E4A2A;color:white;border:none;border-radius:9px;padding:0.55rem;font-size:0.78rem;font-weight:700;cursor:pointer;}

    /* Bottom Nav */
    .yt{position:fixed;bottom:0;left:0;right:0;z-index:200;background:rgba(255,255,255,0.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:space-around;padding:0.5rem 0.25rem calc(0.5rem + env(safe-area-inset-bottom));box-shadow:0 -4px 32px rgba(0,0,0,0.08);}
    .yt-btn{flex:1;border:none;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:0.4rem 0.25rem;position:relative;transition:transform 0.2s;}
    .yt-btn:active{transform:scale(0.88);}
    .yt-btn .ti{color:#aaa;line-height:1;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),color 0.2s;display:flex;}
    .yt-btn.on .ti{transform:scale(1.1);color:#3E4A2A;}
    .yt-btn .tl{font-family:'Manrope',sans-serif;font-size:0.62rem;font-weight:600;color:#aaa;letter-spacing:0.02em;transition:all 0.2s;margin-top:1px;}
    .yt-btn.on .tl{color:#3E4A2A;font-weight:700;}
    .yt-btn .t-pill{position:absolute;top:2px;left:50%;transform:translateX(-50%);width:36px;height:36px;border-radius:50%;background:rgba(62,74,42,0.12);opacity:0;transition:opacity 0.25s;}
    .yt-btn.on .t-pill{opacity:1;}
    .yt-badge{position:absolute;top:0;right:calc(50% - 18px);background:#EF4444;color:white;font-size:0.55rem;font-weight:800;min-width:15px;height:15px;border-radius:999px;display:flex;align-items:center;justify-content:center;padding:0 3px;border:2px solid white;}

    /* Content */
    .yc{width:100%;max-width:1400px;margin:0 auto;padding:1.75rem 2.5rem;padding-bottom:6rem;}
    @media(max-width:768px){.yc{padding:1rem 1rem 6rem;}}

    /* Grid layouts */
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;align-items:start;}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1.25rem;align-items:start;}
    .gfull{grid-column:1/-1;}

    /* Cards */
    .vc{background:white;border-radius:24px;padding:1.5rem;box-shadow:0 4px 24px rgba(0,0,0,0.06);margin-bottom:1.25rem;border:1px solid rgba(0,0,0,0.04);}
    .vc-warm{background:linear-gradient(135deg,#FFFBF5,#FFF7ED);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;border:1.5px solid #EFE0BC;}
    .vc-green{background:linear-gradient(135deg,#E7ECDA,#E7ECDA);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:1.5px solid #E7ECDA;}
    .vc-amber{background:linear-gradient(135deg,#FFFBF0,#FFF8E6);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:2px solid #F59E0B;}
    .vc-indigo{background:linear-gradient(135deg,#FAF6EC,#EFE0BC);border-radius:24px;padding:1.35rem 1.5rem;margin-bottom:1.25rem;border:1.5px solid #EFE0BC;}
    .vc-dark{background:linear-gradient(135deg,#171F10,#2E3820);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;color:white;}
    .vc-gold{background:linear-gradient(135deg,#93711F,#93711F,#BE9346);border-radius:24px;padding:1.5rem;margin-bottom:1.25rem;color:white;}

    /* Stats */
    .ys{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.25rem;}
    .ys-c{background:white;border-radius:20px;padding:1.25rem 0.75rem;text-align:center;border:1px solid #EAE4DC;box-shadow:0 2px 12px rgba(0,0,0,0.05);transition:transform 0.2s;}
    .ys-c:hover{transform:translateY(-2px);}
    .ys-n{font-size:2.2rem;font-weight:800;color:#3E4A2A;font-family:'Fraunces',serif;line-height:1;}
    .ys-l{font-size:0.62rem;color:#aaa;font-weight:600;margin-top:5px;text-transform:uppercase;letter-spacing:0.08em;}

    /* Progress bar */
    .yp{height:10px;background:#EAE4DC;border-radius:999px;overflow:hidden;}
    .yp-f{height:100%;border-radius:999px;background:linear-gradient(90deg,#3E4A2A,#8B9C6B,#E7ECDA);transition:width 0.8s cubic-bezier(0.4,0,0.2,1);}

    /* Day strip */
    .yds{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;margin-bottom:1rem;}
    .yd{background:#F0EBE3;border-radius:8px;padding:5px 2px;text-align:center;font-size:0.58rem;color:#aaa;font-weight:600;transition:all 0.2s;}
    .yd.yd-done{background:#E7ECDA;color:#202A15;}
    .yd.yd-now{background:linear-gradient(135deg,#3E4A2A,#8B9C6B);color:white;box-shadow:0 2px 8px rgba(62,74,42,0.4);}

    /* Warmup tags */
    .wt{display:inline-flex;align-items:center;background:linear-gradient(135deg,#FFF7ED,#FFFBF5);color:#92400E;font-size:0.72rem;padding:5px 12px;border-radius:20px;margin:3px;border:1px solid #EFE0BC;font-weight:500;transition:all 0.15s;}
    .wt:hover{background:#FFF0D6;transform:translateY(-1px);}

    /* Session step header */
    .ssh{display:flex;align-items:center;gap:12px;padding:0.9rem 1.1rem;border-radius:16px;margin-bottom:1rem;}
    .ssn{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:800;color:white;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.2);}

    /* Pose grid */
    .pg{display:grid;grid-template-columns:repeat(3,1fr);gap:0.75rem;}
    .pc{background:white;border-radius:16px;overflow:hidden;border:1px solid #EAE4DC;cursor:pointer;transition:all 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .pc:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,0.12);border-color:#E7ECDA;}
    .pc:active{transform:scale(0.97);}
    .pi{width:100%;height:85px;object-fit:contain;background:linear-gradient(135deg,#FAFAF8,#F5F5F2);display:block;}
    .pni{width:100%;height:85px;background:linear-gradient(135deg,#F3F4F6,#E9EAF0);display:flex;align-items:center;justify-content:center;font-size:1.8rem;}
    .pb{padding:0.5rem 0.65rem 0.6rem;}
    .ps{font-size:0.64rem;font-weight:700;color:#C0392B;margin-bottom:1px;line-height:1.3;}
    .pn{font-size:0.58rem;color:#aaa;font-style:italic;}
    .pnum{font-size:0.55rem;font-weight:800;color:#3E4A2A;margin-bottom:2px;}

    /* Pranayama */
    .pr{display:flex;align-items:center;gap:0.85rem;padding:0.75rem 0;border-bottom:1px solid #F0EBE3;}
    .pr:last-child{border-bottom:none;}
    .prd{width:10px;height:10px;border-radius:50%;background:linear-gradient(135deg,#93711F,#BE9346);flex-shrink:0;box-shadow:0 2px 4px rgba(147,113,31,0.3);}

    /* Attendance grid */
    .ag{display:grid;grid-template-columns:repeat(5,1fr);gap:0.75rem;}
    .adb{background:white;border:2px solid #EAE4DC;border-radius:18px;padding:0.85rem 0.4rem;cursor:pointer;text-align:center;transition:all 0.25s;font-family:'Manrope',sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.04);}
    .adb:active{transform:scale(0.94);}
    .adb.adone{background:linear-gradient(135deg,#3E4A2A,#8B9C6B);border-color:#3E4A2A;box-shadow:0 4px 16px rgba(62,74,42,0.3);}
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
    .mb{display:flex;flex-direction:column;align-items:center;gap:5px;background:none;border:2.5px solid transparent;border-radius:16px;padding:12px 16px;cursor:pointer;transition:all 0.2s;font-family:'Manrope',sans-serif;}
    .mb:hover{background:#F5F0EA;border-color:#EAE4DC;transform:translateY(-2px);}
    .mb.mp{background:#E7ECDA;border-color:#3E4A2A;}
    .me{font-size:2.2rem;}
    .ml{font-size:0.68rem;font-weight:600;color:#6b7280;}

    /* Pose popup */
    .po{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:300;display:flex;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(8px);}
    .pp{background:white;border-radius:28px;max-width:480px;width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 80px rgba(0,0,0,0.3);animation:pIn 0.25s cubic-bezier(0.4,0,0.2,1);}
    @keyframes pIn{from{opacity:0;transform:scale(0.92)translateY(20px);}to{opacity:1;transform:scale(1)translateY(0);}}
    .ppi{width:100%;height:230px;object-fit:contain;background:linear-gradient(135deg,#F9FAFB,#E7ECDA);border-radius:28px 28px 0 0;}
    .ppb{padding:1.5rem;}
    .badge{font-size:0.72rem;font-weight:700;padding:4px 12px;border-radius:999px;display:inline-block;margin-right:5px;margin-bottom:5px;}
    .bg{background:#E7ECDA;color:#3E4A2A;}
    .bi{background:#EFE0BC;color:#93711F;}
    .br{background:#FEF2F2;color:#DC2626;}

    /* History */
    .hc{background:white;border-radius:20px;overflow:hidden;margin-bottom:1rem;border:1px solid #EAE4DC;box-shadow:0 2px 12px rgba(0,0,0,0.04);}
    .hh{padding:1.1rem 1.35rem;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:background 0.2s;}
    .hh:hover{background:#FAFAF8;}
    .hb{padding:1.1rem 1.35rem;border-top:1px solid #F0EBE3;background:#FAFAF8;}

    /* Buttons */
    .btn-p{width:100%;padding:1rem;background:linear-gradient(135deg,#3E4A2A,#8B9C6B);color:white;border:none;border-radius:16px;font-size:0.95rem;font-weight:700;cursor:pointer;font-family:'Manrope',sans-serif;transition:all 0.2s;margin-bottom:0.75rem;box-shadow:0 4px 16px rgba(62,74,42,0.3);letter-spacing:0.02em;}
    .btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(62,74,42,0.4);}
    .btn-w{display:flex;align-items:center;justify-content:center;gap:0.5rem;width:100%;padding:1rem;background:linear-gradient(135deg,#3E4A2A,#25D366);color:white;border:none;border-radius:16px;font-size:0.9rem;font-weight:700;cursor:pointer;text-decoration:none;font-family:'Manrope',sans-serif;box-shadow:0 4px 16px rgba(37,211,102,0.3);transition:all 0.2s;}
    .btn-w:hover{transform:translateY(-1px);}
    .btn-cert{background:linear-gradient(135deg,#93711F,#93711F,#BE9346);color:white;border:none;border-radius:16px;padding:1rem 1.5rem;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:'Manrope',sans-serif;width:100%;box-shadow:0 4px 16px rgba(190,147,70,0.3);}

    /* Alert */
    .alert{background:linear-gradient(135deg,#FFFBF0,#FFF8E6);border:2px solid #F59E0B;border-radius:18px;padding:1rem 1.25rem;margin-bottom:1.25rem;display:flex;align-items:center;gap:0.85rem;box-shadow:0 4px 16px rgba(245,158,11,0.15);}

    /* Typography helpers */
    .serif{font-family:'Fraunces',serif;}
    .muted{color:#aaa;}
    .green{color:#3E4A2A;}
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
              <div className="yh-sub">{currentPlan ? `Cycle ${currentPlan.cycleNumber} · ${currentPlan.style} · ${currentPlan.duration} min` : "Navira Yoga Studio"}</div>
              <div className="yh-date">{today}</div>
            </div>
          </div>
          <div className="yh-r">
            {!isAppInstalled && (
              <div style={{ position: "relative" }}>
                <button className="yh-install" onClick={() => setShowInstallPop(v => !v)} aria-label="Install app" title="Install app">⇩</button>
                {showInstallPop && (
                  <div className="yh-install-pop">
                    <div className="t">Install Navira Yoga</div>
                    <div className="d">Add the app to your home screen for quick, offline-ready access.</div>
                    {installPrompt ? (
                      <button className="go" onClick={handleInstall}>Install Now</button>
                    ) : (
                      <div className="d" style={{ marginTop: "0.6rem" }}>
                        iPhone: tap Share → "Add to Home Screen"<br/>
                        Android: tap ⋮ menu → "Add to Home Screen"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <button className="yh-out" onClick={handleLogout}>Logout</button>
          </div>
        </div>


        {/* ── BOTTOM NAV ── */}
        <div className="yt">
          {[
            { id: "plan",     label: "Plan" },
            { id: "practice", label: "Practice" },
            { id: "attend",   label: "Attend" },
            { id: "history",  label: "History" },
            { id: "notes",    label: "Notes" },
            { id: "payments", label: "Pay" },
          ].map(t => (
            <button key={t.id} className={`yt-btn ${activeTab === t.id ? "on" : ""}`} onClick={() => setActiveTab(t.id)}>
              <span className="t-pill" />
              <span className="ti"><NavIcon id={t.id} /></span>
              <span className="tl">{t.label}{t.id === "notes" && unreadCount > 0 && <span className="yt-badge">{unreadCount}</span>}</span>
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
                    <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: "0.5rem" }}>Navira Yoga Studio · Your personal journey</div>
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
                          <span style={{ background: "linear-gradient(135deg,#E7ECDA,#E7ECDA)", color: "#202A15", fontSize: "0.72rem", fontWeight: 700, padding: "5px 14px", borderRadius: "20px", border: "1px solid #E7ECDA" }}>🟢 Active</span>
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
                          <span>Your Progress</span><span style={{ fontWeight: 700, color: "#3E4A2A" }}>{attendedCount}/10 days</span>
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
                        <a className="btn-w" href={`https://wa.me/917996272792?text=Hi%20Navira%20Yoga%20Studio%2C%20I%20am%20${encodeURIComponent(student?.name || "")}%20and%20I%20need%20help.`} target="_blank" rel="noopener noreferrer">
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
                          <div className="ssh" style={{ background: "linear-gradient(135deg,#EFE0BC,#EFE0BC)" }}>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#93711F,#BE9346)" }}>
                              {(getWarmupPoses(currentPlan).length > 0 ? 1 : 0) + (showSurya(currentPlan) ? 1 : 0) + 2}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#93711F", fontSize: "0.95rem" }}>🌬️ Pranayama & Relaxation</div>
                              <div style={{ fontSize: "0.7rem", color: "#93711F" }}>Breathing · Cool down · Savasana</div>
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
                          <div className="ssh" style={{ background: "linear-gradient(135deg,#E7ECDA,#E7ECDA)" }}>
                            <div className="ssn" style={{ background: "linear-gradient(135deg,#3E4A2A,#8B9C6B)" }}>
                              {(getWarmupPoses(currentPlan).length > 0 ? 1 : 0) + (showSurya(currentPlan) ? 1 : 0) + 1}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: "#202A15", fontSize: "0.95rem" }}>🧘 Asanas</div>
                              <div style={{ fontSize: "0.7rem", color: "#3E4A2A" }}>Tap any pose for detailed instructions</div>
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
                    <div className="serif" style={{ fontSize: "3rem", fontWeight: 800, color: "#8B9C6B" }}>{Math.round(attendedCount * 10)}%</div>
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
                                style={{ background: "white", borderRadius: "14px", padding: "0.65rem 0.4rem", border: `1.5px solid ${done ? "#EFE0BC" : "#EAE4DC"}`, textAlign: "center", cursor: done ? "pointer" : "default", opacity: done ? 1 : 0.4, transition: "all 0.2s", boxShadow: done ? "0 2px 8px rgba(0,0,0,0.06)" : "none" }}>
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
                          <div className="serif" style={{ fontSize: "1rem", fontWeight: 700, color: "#93711F", marginBottom: "1rem" }}>💡 Practice Tips</div>
                          {[
                            "Practice at the same time each day",
                            "Even 20 minutes counts — mark your day",
                            "Log your mood to track your journey",
                            "Consistency matters more than perfection",
                            "Your mat is always waiting for you 🧘",
                          ].map((tip, i) => (
                            <div key={i} style={{ display: "flex", gap: "0.6rem", marginBottom: "0.6rem", fontSize: "0.84rem", color: "#93711F", alignItems: "flex-start" }}>
                              <span style={{ color: "#BE9346", marginTop: "1px", flexShrink: 0 }}>✦</span>{tip}
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
                            style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "10px", padding: "6px 14px", fontSize: "0.75rem", cursor: "pointer", color: "#374151", fontFamily: "'Manrope',sans-serif" }}>
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
                              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#202A15", marginBottom: "0.75rem" }}>🧘 Asanas</div>
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
                              <div style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#93711F", marginBottom: "0.5rem" }}>🌬️ Pranayama</div>
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
                          <span style={{ background: "#E7ECDA", color: "#202A15", fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>Cycle {n.cycleNumber}</span>
                          <span style={{ fontSize: "0.75rem", color: "#aaa" }}>{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                        {!n.isRead && <span style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "10px", fontWeight: 700, padding: "3px 10px", borderRadius: "20px" }}>🔴 NEW</span>}
                      </div>
                      <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{n.note}</p>
                      <div style={{ fontSize: "0.72rem", color: "#aaa", marginTop: "0.75rem", fontStyle: "italic" }}>— Your Instructor, Navira Yoga Studio</div>
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
                <button onClick={() => setMoodDay(null)} style={{ background: "none", border: "none", color: "#aaa", fontSize: "0.82rem", cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
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
                  <div style={{ background: "linear-gradient(135deg,#E7ECDA,#E7ECDA)", borderRadius: "16px", padding: "1rem 1.1rem" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#202A15", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>✨ Benefits</div>
                    <p style={{ fontSize: "0.85rem", color: "#202A15", lineHeight: 1.65 }}>{selectedPose.benefits || selectedPose.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}


          {activeTab === "payments" && (
            <div style={{ padding: "0.5rem 0" }}>
              {myPayments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💳</div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#1a2018", marginBottom: "0.5rem" }}>No payment records yet</div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Your payment history will appear here.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {(() => {
                    const paid = myPayments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
                    const due = myPayments.filter(p => p.status === "unpaid").reduce((s, p) => s + p.amount, 0);
                    const total = myPayments.reduce((s, p) => s + p.amount, 0);
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "0.5rem" }}>
                        <div style={{ background: "linear-gradient(135deg,#E7ECDA,#E7ECDA)", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #E7ECDA" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3E4A2A" }}>Rs.{paid.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#6E7460", fontWeight: 600, marginTop: "3px", textTransform: "uppercase" }}>Paid</div>
                        </div>
                        <div style={{ background: "#FEF2F2", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #fca5a5" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#DC2626" }}>Rs.{due.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#b91c1c", fontWeight: 600, marginTop: "3px", textTransform: "uppercase" }}>Due</div>
                        </div>
                        <div style={{ background: "#F9FAFB", borderRadius: "14px", padding: "1rem", textAlign: "center", border: "1px solid #e5e7eb" }}>
                          <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#374151" }}>Rs.{total.toLocaleString()}</div>
                          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginTop: "3px", textTransform: "uppercase" }}>Total</div>
                        </div>
                      </div>
                    );
                  })()}
                  {myPayments.map(p => (
                    <div key={p.id} style={{ background: "white", borderRadius: "14px", padding: "1rem 1.25rem", border: "1px solid #E7ECDA", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: p.status === "paid" ? "#E7ECDA" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
                          {p.status === "paid" ? "✅" : "⏳"}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#1a2018" }}>{p.month} {p.year}</div>
                          {p.notes && <div style={{ fontSize: "0.78rem", color: "#6b7280", marginTop: "2px" }}>{p.notes}</div>}
                          {p.paidAt && <div style={{ fontSize: "0.72rem", color: "#3E4A2A", marginTop: "2px" }}>Paid on {new Date(p.paidAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: p.status === "paid" ? "#3E4A2A" : "#DC2626" }}>Rs.{p.amount.toLocaleString()}</div>
                        <div style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: p.status === "paid" ? "#E7ECDA" : "#FEF2F2", color: p.status === "paid" ? "#202A15" : "#DC2626", marginTop: "4px", display: "inline-block" }}>
                          {p.status === "paid" ? "Paid ✓" : "Due"}
                        </div>
                        {p.status === "paid" && (
                          <button onClick={() => downloadReceipt(p)} style={{ display: "block", marginTop: "8px", background: "#3E4A2A", border: "none", color: "white", borderRadius: "6px", padding: "5px 10px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", width: "100%" }}>
                            🧾 Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {myPayments.some(p => p.status === "unpaid") && (
                    <a href={"https://wa.me/917996272792?text=Hi%20Navira%20Yoga%20Studio%2C%20I%20am%20" + encodeURIComponent(student?.name || "") + "%20and%20I%20would%20like%20to%20clear%20my%20pending%20payment."} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.85rem", background: "#25D366", color: "white", borderRadius: "12px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", marginTop: "0.5rem" }}>
                      💬 Contact Instructor to Pay
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#C8BFB0", padding: "2rem 1rem 1.5rem", fontFamily: "serif", fontStyle: "italic" }}>
          Navira Yoga Studio · Your personal yoga journey 🌿
        </p>

      </div>
    </>
  );
}
// Fri Jun 12 16:48:43 IST 2026
