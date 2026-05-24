import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studioId = searchParams.get("studioId");
  const where = studioId ? { studioId } : { studioId: null };

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      sequences: { orderBy: { createdAt: "desc" }, take: 1 },
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

  return NextResponse.json(attendanceData);
}
