import Link from "next/link";
import { prisma } from "@/lib/db";
import { getCycleStatus } from "@/lib/cycleStatus";

export const revalidate = 0;

export const metadata = { title: "Dashboard — IRA Yoga Studio" };

export default async function DashboardPage() {
  const [clientCount, sequenceCount, clients] = await Promise.all([
    prisma.client.count(),
    prisma.sequence.count(),
    prisma.client.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sequences: true } },
        sequences: { take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
  ]);

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  const needRenewal = clients.filter(c => getCycleStatus(c).status === "ended");

  return (
    <div>
      <div className="welcome-banner" style={{ marginBottom: "1.75rem" }}>
        <div className="welcome-text">
          <h2>Welcome to IRA Yoga Studio 🙏</h2>
          <p>Curate, review, and refine asana plans personalised for each student's unique journey.</p>
        </div>
      </div>

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
                      <div style={{ fontSize: "0.8rem", color: "#B45309" }}>
                        Cycle {cycle.cycleNumber} ended · {formatDate(cycle.endDate)}
                      </div>
                    </div>
                  </div>
                  <Link href={`/clients/${c.id}#sequences`} className="btn btn-saffron btn-sm">
                    🔄 Renew Now
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                  <th>Date of Joining</th>
                  <th>Current Cycle</th>
                  <th>Plan Start</th>
                  <th>Plan End</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c, idx) => {
                  const cycle = getCycleStatus(c);
                  const isEnded = cycle.status === "ended";
                  return (
                    <tr key={c.id} style={{ background: isEnded ? "#FFFBEB" : "transparent" }}>
                      <td style={{ color: "var(--text-muted)" }}>{idx + 1}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div className="student-avatar">{c.name.charAt(0).toUpperCase()}</div>
                          <Link href={`/clients/${c.id}`} style={{ fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>
                            {c.name}
                          </Link>
                        </div>
                      </td>
                      <td>{formatDate(c.joinDate || c.createdAt)}</td>
                      <td style={{ fontWeight: 600 }}>{cycle.status === "none" ? "—" : `Cycle ${cycle.cycleNumber}`}</td>
                      <td>{cycle.status === "none" ? "—" : formatDate(cycle.startDate)}</td>
                      <td>{cycle.status === "none" ? "—" : formatDate(cycle.endDate)}</td>
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
              Showing 1 – {clients.length} of {clients.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
