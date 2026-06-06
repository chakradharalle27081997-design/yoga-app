import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studioId = searchParams.get("studioId");
  const where = (!studioId || studioId === "owner") ? {} : { studioId };
  const approvedWhere = { ...where, registrationStatus: { not: "pending" } };

  const [clientCount, sequenceCount, clients, pendingCount, pendingClients] = await Promise.all([
    prisma.client.count({ where: approvedWhere }),
    prisma.sequence.count({ where: { client: approvedWhere } }),
    prisma.client.findMany({
      where: approvedWhere,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sequences: true } },
        sequences: { take: 1, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.client.count({ where: { ...where, registrationStatus: "pending" } }),
    prisma.client.findMany({
      where: { ...where, registrationStatus: "pending" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true, age: true, goals: true, createdAt: true },
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

  return NextResponse.json({ clientCount, sequenceCount, clients, attendanceMap, pendingCount, pendingClients });
}
