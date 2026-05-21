import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req, { params }) {
  const sequence = await prisma.sequence.findUnique({
    where: { id: params.id },
    include: { client: true },
  });
  if (!sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(sequence);
}

export async function PUT(req, { params }) {
  const body = await req.json();
  const updated = await prisma.sequence.update({
    where: { id: params.id },
    data: {
      title: body.title,
      duration: parseInt(body.duration),
      style: body.style,
      goal: body.goal,
      energy: body.energy,
      poses: typeof body.poses === "string" ? body.poses : JSON.stringify(body.poses),
      asanaCount: body.asanaCount || 6,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  await prisma.sequence.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
