import { prisma } from "@/lib/db";
import Link from "next/link";

export const revalidate = 0;

async function getAttendanceData() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      sequences: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const attendanceData = await Promise.all(clients.map(async (client) => {
    const currentSeq = client.sequences[0];
    if (!currentSeq) return { client, attended: 0, total: 0, records: [] };
    const records = await prisma.attendance.findMany({
      where: { clientId: client.id, sequenceId: currentSeq.id },
      orderBy: { day: "asc" },
    });
    const attended = records.filter(r => r.attended).length;
    return { client, sequence: currentSeq, attended, total: 10, records };
  }));

  return attendanceData;
}

export default async function AttendancePage() {
  const data = await getAttendanceData();

  function formatDate(d) {
    return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).toUpperCase();
  }

  function getPlanDates(seq) {
    const start = new Date(seq.createdAt);
    const end = new Date(start);
    end.setDate(end.getDate() + 9);
    return { start, end };
  }

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 className="page-title">Attendance Report</h1>
          <p className="page-subtitle">Current cycle attendance for all students</p>
        </div>
        <Link href="/" className="btn btn-outline btn-sm">← Dashboard</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-number">{data.length}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.filter(d => d.attended === 10).length}</div>
          <div className="stat-label">100% Attendance</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{data.filter(d => d.attended === 0 && d.sequence).length}</div>
          <div className="stat-label">Not Started</div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Phone</th>
                <th>Cycle</th>
                <th>Plan Period</th>
                <th>Attendance</th>
                <th style={{ textAlign: "center" }}>Days</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map(({ client, sequence, attended, records }) => {
                const pct = sequence ? Math.round((attended / 10) * 100) : 0;
                const color = pct === 100 ? "#1D9E75" : pct >= 50 ? "#F59E0B" : "#DC2626";
                return (
                  <tr key={client.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="student-avatar">{client.name.charAt(0).toUpperCase()}</div>
                        <Link href={`/clients/${client.id}`} style={{ fontWeight: 600, color: "var(--brand)", textDecoration: "underline" }}>
                          {client.name}
                        </Link>
                      </div>
                    </td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>{client.phone || "—"}</td>
                    <td style={{ fontSize: "13px" }}>{sequence ? `Cycle ${sequence.cycleNumber}` : "—"}</td>
                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {sequence ? `${formatDate(getPlanDates(sequence).start)} — ${formatDate(getPlanDates(sequence).end)}` : "—"}
                    </td>
                    <td>
                      {sequence ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ flex: 1, height: "8px", background: "#e5e7eb", borderRadius: "999px", minWidth: "80px" }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.3s" }} />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 600, color }}>{pct}%</span>
                        </div>
                      ) : <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>No plan</span>}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {sequence ? (
                        <div style={{ display: "flex", gap: "3px", justifyContent: "center" }}>
                          {Array.from({ length: 10 }, (_, i) => {
                            const record = records.find(r => r.day === i + 1);
                            return (
                              <div key={i} style={{ width: "16px", height: "16px", borderRadius: "3px", background: record?.attended ? "#1D9E75" : "#e5e7eb", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                {record?.attended ? "✓" : ""}
                              </div>
                            );
                          })}
                        </div>
                      ) : "—"}
                    </td>
                    <td>
                      <Link href={`/clients/${client.id}`} className="btn btn-primary btn-sm">View</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
