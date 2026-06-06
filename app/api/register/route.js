import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const client = await prisma.client.create({
      data: {
        name:         body.name,
        age:          parseInt(body.age) || 0,
        gender:       body.gender || "",
        phone:        body.phone || "",
        experience:   body.experience || "beginner",
        goals:        body.goals || "",
        conditions:   body.conditions || "",
        injuries:     body.injuries || "",
        surgeries:    body.surgeries || "",
        familyHistory: body.familyHistory || "",
        stressLevel:  body.stressLevel || "",
        sleepPattern: body.sleepPattern || "",
        angerLevel:   body.angerLevel || "",
        mealType:     body.mealType || "",
        stayType:     body.stayType || "",
        notes:        [body.notes, body.conditionDetails, body.injuryDetails, body.surgeryDetails, body.mentalHealthDetails, body.medicationDetails].filter(Boolean).join(" | ") || "",
        pin:          "",
        registrationStatus: "pending",
      },
    });
    return NextResponse.json({ success: true, id: client.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
