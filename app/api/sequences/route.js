import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const sequences = await prisma.sequence.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { name: true } } },
  });
  return NextResponse.json(sequences);
}
