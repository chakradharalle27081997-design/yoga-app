import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const testerId = searchParams.get("testerId");

  const where = testerId ? { testerId } : { testerId: null };

  const clients = await prisma.client.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { sequences: true } },
      sequences: { take: 1, orderBy: { createdAt: "desc" } },
    },
  });
  const parsed = clients.map((c) => ({
    ...c,
    injuries:      c.injuries      ? c.injuries.split(",").filter(Boolean)      : [],
    conditions:    c.conditions    ? c.conditions.split(",").filter(Boolean)    : [],
    goals:         c.goals         ? c.goals.split(",").filter(Boolean)         : [],
    surgeries:     c.surgeries     ? c.surgeries.split(",").filter(Boolean)     : [],
    familyHistory: c.familyHistory ? c.familyHistory.split(",").filter(Boolean) : [],
  }));
  return NextResponse.json(parsed);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const client = await prisma.client.create({
      data: {
        name:         body.name,
        age:          parseInt(body.age),
        gender:       body.gender || null,
        experience:   body.experience,
        injuries:     (body.injuries     || []).join(","),
        conditions:   (body.conditions   || []).join(","),
        notes:        body.notes || null,
        joinDate:     body.joinDate ? new Date(body.joinDate) : new Date(),
        goals:        (body.goals        || []).join(","),
        surgeries:    (body.surgeries    || []).join(","),
        familyHistory:(body.familyHistory|| []).join(","),
        stressLevel:  body.stressLevel  || "",
        sleepPattern: body.sleepPattern || "",
        angerLevel:   body.angerLevel   || "",
        mealType:     body.mealType     || "",
        stayType:     body.stayType     || "",
        phone:        body.phone        || "",
        pin:          body.pin          || "",
        testerId:     body.testerId     || null,
      },
    });
    return NextResponse.json(client, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
