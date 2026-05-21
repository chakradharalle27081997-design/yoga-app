import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req) {
  const { phone, pin } = await req.json();
  if (!phone || !pin) return NextResponse.json({ error: "Phone and PIN required" }, { status: 400 });
  const client = await prisma.client.findFirst({
    where: { phone: phone.trim(), pin: pin.trim() },
    include: { sequences: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  if (!client) return NextResponse.json({ error: "Invalid phone or PIN" }, { status: 401 });
  return NextResponse.json({ success: true, clientId: client.id, name: client.name });
}
