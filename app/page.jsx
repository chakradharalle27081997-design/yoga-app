import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCycleStatus } from "@/lib/cycleStatus";

export const revalidate = 0;

export const metadata = { title: "Dashboard — IRA Yoga Studio" };

const quotes = [
  { sanskrit: "योगः चित्त-वृत्ति निरोधः", transliteration: "Yogaḥ citta-vṛtti nirodhaḥ", meaning: "Yoga is the stilling of the fluctuations of the mind." },
  { sanskrit: "स्थिरं सुखं आसनम्", transliteration: "Sthiraṁ sukhaṁ āsanam", meaning: "The posture should be steady and comfortable." },
  { sanskrit: "तत्र स्थितौ यत्नोऽभ्यासः", transliteration: "Tatra sthitau yatno'bhyāsaḥ", meaning: "Practice is the effort to be fixed in that state." },
  { sanskrit: "सर्वे भवन्तु सुखिनः", transliteration: "Sarve bhavantu sukhinaḥ", meaning: "May all beings be happy." },
  { sanskrit: "आरोग्यं परमं भाग्यम्", transliteration: "Ārogyaṁ paramaṁ bhāgyam", meaning: "Health is the greatest blessing." },
  { sanskrit: "अहिंसा परमो धर्मः", transliteration: "Ahiṁsā paramo dharmaḥ", meaning: "Non-violence is the highest virtue." },
  { sanskrit: "शनैः शनैः उपरमेत्", transliteration: "Śanaiḥ śanaiḥ uparamet", meaning: "Little by little, let one come to rest." },
];

export default async function DashboardPage() {
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
  const dayIndex = new Date().getDay();
  const quote = quotes[dayIndex];

  const [clientCount, sequenceCount, clients] = await Promise.all([
    prisma.client.count(),
    prisma.sequence.count(),
    prisma.client.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sequences: true } },
        sequences: { take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
  ]);

  const attendanceMap = {};
  await Promise.all(clients.map(async (c) => {
    const seq = c.sequences[0];
    if (!seq) return;
    const records = await prisma.attendance.findMany({
      where: { clientId: c.id, sequenceId: seq.id },
    });
    attendanceMap[c.id] = records.filter(r => r.attended).length;
  }));

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  const needRenewal = clients.filter(c => getCycleStatus(c).status === "ended");

  return (
    <div>
      {/* Welcome Banner */}
      <div className="welcome-banner" style={{ marginBottom: "1.75rem" }}>
        <div className="welcome-text">
          <h2>Welcome to IRA Yoga Studio 🙏</h2>
          <p>Curate, review, and refine asana plans personalised for each student's unique journey.</p>
          <p style={{ fontSize: "0.8rem", opacity: 0.75, marginTop: "0.4rem" }}>📅 {today}</p>
        </div>
        <div style={{ textAlign: "right", zIndex: 1, maxWidth: "320px" }}>
          <div style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.9)", fontFamily: "serif", marginBottom: "0.5rem", lineHeight: 1.4 }}>{quote.sanskrit}</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", fontStyle: "italic", marginBottom: "0.35rem" }}>{quote.transliteration}</div>
          <div style={{ fontSize: "0.82rem", color: "var(--turmeric)", fontWeight: 600 }}>"{quote.meaning}"</div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-row">
        <Link href="/clients" style={{ textDecoration: "none" }}>
          <div className="stat-card">
            <div className="stat-number">{clientCount}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </Link>
        <div className="stat-card">
          <div className="stat-number">{sequenceCount}</div>
          <div className="stat-label">Sequences Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{clients.filter(c => getCycleStatus(c).status === "active").length}</div>
          <div className="stat-label">Active Plans</div>
        </div>
        <div className="stat-card" style={{ borderColor: needRenewal.length > 0 ? "#F59E0B" : "var(--border)", background: needRenewal.length > 0 ? "#FFFBEB" : "var(--surface)" }}>
          <div className="stat-number" style={{ color: needRenewal.length > 0 ? "#D97706" : "var(--saffron)" }}>{needRenewal.length}</div>
          <div className="stat-label">Need Renewal</div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.75rem", flexWrap: "wrap" }}>
        <Link href="/attendance" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <span style={{ fontSize: "1.5rem" }}>📊</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand)" }}>Attendance Report</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>View all students' attendance</div>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "1.1rem" }}>→</span>
          </div>
        </Link>
        <Link href="/clients?action=add" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <span style={{ fontSize: "1.5rem" }}>➕</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand)" }}>Add New Student</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Register a new student</div>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "1.1rem" }}>→</span>
          </div>
        </Link>
        <Link href="/clients" style={{ textDecoration: "none", flex: 1, minWidth: "200px" }}>
          <div style={{ background: "white", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }}>
            <span style={{ fontSize: "1.5rem" }}>👥</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--brand)" }}>My Students</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Manage all students</div>
            </div>
            <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "1.1rem" }}>→</span>
          </div>
        </Link>
      </div>

      {/* Renewal Alert */}
      {needRenewal.length > 0 && (
        <div style={{ background: "#FFFBEB", border: "1px solid #F59E0B", borderRadius: "12px", padding: "1.25rem 1.5rem", marginBottom: "1.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.1rem" }}>⚠️</span>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#92400E" }}>
              {needRenewal.length} student{needRenewal.length > 1 ? "s" : ""} need a new cycle
            </div>
            <div style={{ fontSize: "0.85rem", color: "#B45309", marginLeft: "0.25rem" }}>— their 10-day plan has ended</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {needRenewal.map(c => {
              const cycle = getCycleStatus(c);
              return (
                <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "white", border: "1px solid #FCD34D", borderRadius: "8px", padding: "0.75rem 1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF3C7", color: "#92400E", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.95rem" }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", color: "#1a2018" }}>{c.name}</div>
                      <div style={{ fontSize: "0.8rem", color: "#B45309" }}>Cycle {cycle.cycleNumber} ended · {formatDate(cycle.endDate)}</div>
                    </div>
                  </div>
                  <Link href={`/clients/${c.id}#sequences`} className="btn btn-saffron btn-sm">🔄 Renew Now</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Students Table */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600 }}>My Yoga Students</h2>
          <Link href="/clients?action=add" className="btn btn-saffron btn-sm">+ Add Student</Link>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🧘</div>
            <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>No students enrolled yet.</p>
            <Link href="/clients" className="btn btn-primary">+ Add Your First Student</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>SI No.</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Date of Joining</th>
                  <th>Current Cycle</th>
                  <th>Plan Start</th>
                  <th>Plan End</th>
                  <th>Attendance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => {
                  const cycle = getCycleStatus(c);
                  const isEnded = cycle.status === "ended";
                  const attended = attendanceMap[c.id] ?? 0;
                  const hasSeq = cycle.status !== "none";
                  return (
                    <tr key={c.id} style={{ background: isEnded ? "#FFFBEB" : "transparent" }}>
                      <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="student-avatar">{c.name.charAt(0).toUpperCase()}</div>
                          <Link href={`/clients/${c.id}`} style={{ fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>{c.name}</Link>
                        </div>
                      </td>
                      <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{c.phone || "—"}</td>
                      <td>{formatDate(c.joinDate || c.createdAt)}</td>
                      <td style={{ fontWeight: 600 }}>{cycle.status === "none" ? "—" : `Cycle ${cycle.cycleNumber}`}</td>
                      <td>{cycle.status === "none" ? "—" : formatDate(cycle.startDate)}</td>
                      <td>{cycle.status === "none" ? "—" : formatDate(cycle.endDate)}</td>
                      <td>
                        {hasSeq ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "60px", height: "6px", background: "#e5e7eb", borderRadius: "999px" }}>
                              <div style={{ width: `${(attended / 10) * 100}%`, height: "100%", background: attended === 10 ? "#1D9E75" : attended >= 5 ? "#F59E0B" : "#DC2626", borderRadius: "999px" }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)" }}>{attended}/10</span>
                          </div>
                        ) : <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>—</span>}
                      </td>
                      <td>
                        {cycle.status === "none" && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No plan yet</span>}
                        {cycle.status === "active" && <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", background: "#E1F5EE", color: "#0F6E56" }}>🟢 {cycle.daysLeft}d left</span>}
                        {cycle.status === "ended" && <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "4px 12px", borderRadius: "999px", background: "#FEE2E2", color: "#DC2626" }}>🔴 Ended</span>}
                      </td>
                      <td>
                        <Link href={`/clients/${c.id}#sequences`} className="btn btn-primary btn-sm">
                          {cycle.status === "ended" ? "🔄 Renew" : cycle.status === "none" ? "Generate" : "View"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ padding: "0.75rem 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Showing all {clients.length} student{clients.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
