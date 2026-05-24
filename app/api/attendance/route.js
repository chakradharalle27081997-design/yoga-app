import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const sequenceId = searchParams.get("sequenceId");
  if (!clientId || !sequenceId) return NextResponse.json([]);
  const records = await prisma.attendance.findMany({
    where: { clientId, sequenceId }
  });
  return NextResponse.json(records);
}

export async function POST(req) {
  const { clientId, sequenceId, day, attended } = await req.json();
  const record = await prisma.attendance.upsert({
    where: { clientId_sequenceId_day: { clientId, sequenceId, day } },
    update: { attended },
    create: { clientId, sequenceId, day, attended }
  });
  return NextResponse.json(record);
}
