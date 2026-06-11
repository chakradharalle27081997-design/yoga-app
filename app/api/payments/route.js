import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "clientId required" }, { status: 400 });
  const payments = await prisma.payment.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req) {
  const { clientId, amount, month, year, notes } = await req.json();
  if (!clientId || !amount || !month || !year) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  const payment = await prisma.payment.create({
    data: {
      clientId,
      amount: parseFloat(amount),
      month,
      year: parseInt(year),
      status: "unpaid",
      notes: notes || "",
    },
  });
  return NextResponse.json(payment);
}

export async function PATCH(req) {
  const { id, status } = await req.json();
  const payment = await prisma.payment.update({
    where: { id },
    data: {
      status,
      paidAt: status === "paid" ? new Date() : null,
    },
  });
  return NextResponse.json(payment);
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
