import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studioId = searchParams.get("studioId");
  const where = studioId ? { studioId } : { studioId: null };

  const [clientCount, sequenceCount, clients] = await Promise.all([
    prisma.client.count({ where }),
    prisma.sequence.count({ where: { client: where } }),
    prisma.client.findMany({
      where,
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

  return NextResponse.json({ clientCount, sequenceCount, clients, attendanceMap });
}
