import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Register new studio
export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const existing = await prisma.studio.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    const studio = await prisma.studio.create({
      data: { name, email, password, status: "pending" }
    });
    return NextResponse.json({ studio });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Login studio
export async function PUT(req) {
  try {
    const { email, password } = await req.json();
    const studio = await prisma.studio.findUnique({ where: { email } });
    if (!studio || studio.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    if (studio.status === "pending") {
      return NextResponse.json({ error: "Your account is pending approval from IRA Yoga Studio" }, { status: 403 });
    }
    if (studio.status === "suspended") {
      return NextResponse.json({ error: "Your account has been suspended. Contact IRA Yoga Studio." }, { status: 403 });
    }
    return NextResponse.json({ studio });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
