import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "irayoga2024";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { clients: true } } }
  });
  return NextResponse.json({ studios });
}

export async function PATCH(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("password") !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  const studio = await prisma.studio.update({ where: { id }, data: { status } });
  return NextResponse.json({ studio });
}
