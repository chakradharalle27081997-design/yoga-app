import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const notes = await prisma.sessionNote.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req) {
  const { clientId, cycleNumber, note } = await req.json();
  if (!clientId || !note) return NextResponse.json({ error: "clientId and note required" }, { status: 400 });
  const created = await prisma.sessionNote.create({
    data: { clientId, cycleNumber: parseInt(cycleNumber) || 1, note },
  });
  return NextResponse.json(created);
}

export async function PATCH(req) {
  const { id } = await req.json();
  const updated = await prisma.sessionNote.update({
    where: { id },
    data: { isRead: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.sessionNote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
