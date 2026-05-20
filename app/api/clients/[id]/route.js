import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function parseClient(c) {
  return {
    ...c,
    injuries: c.injuries ? c.injuries.split(",").filter(Boolean) : [],
    conditions: c.conditions ? c.conditions.split(",").filter(Boolean) : [],
    goals: c.goals ? c.goals.split(",").filter(Boolean) : [],
    surgeries: c.surgeries ? c.surgeries.split(",").filter(Boolean) : [],
    familyHistory: c.familyHistory ? c.familyHistory.split(",").filter(Boolean) : [],
    sequences: c.sequences
      ? c.sequences.map((s) => ({ ...s, poses: JSON.parse(s.poses || "{}") }))
      : undefined,
  };
}

export async function GET(req, { params }) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: { sequences: { orderBy: { createdAt: "desc" } }, _count: { select: { sequences: true } } },
  });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(parseClient(client));
}

export async function PUT(req, { params }) {
  const body = await req.json();
  const updated = await prisma.client.update({
    where: { id: params.id },
    data: {
      name: body.name,
      age: parseInt(body.age),
      gender: body.gender,
      experience: body.experience,
      injuries: (body.injuries || []).join(","),
      conditions: (body.conditions || []).join(","),
      notes: body.notes,
      joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
      goals: (body.goals || []).join(","),
      surgeries: (body.surgeries || []).join(","),
      familyHistory: (body.familyHistory || []).join(","),
      stressLevel: body.stressLevel || "",
      sleepPattern: body.sleepPattern || "",
      angerLevel: body.angerLevel || "",
      mealType: body.mealType || "",
      stayType: body.stayType || "",
    },
  });
  return NextResponse.json(parseClient(updated));
}

export async function DELETE(req, { params }) {
  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
