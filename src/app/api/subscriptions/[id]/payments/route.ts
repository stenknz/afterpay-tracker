import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const sub = await prisma.subscription.findFirst({
    where: { id, OR: [{ userId }, { visibility: "SHARED" }] },
  });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const payments = await prisma.subscriptionPayment.findMany({
    where: { subscriptionId: id },
    orderBy: { paidAt: "desc" },
  });

  return NextResponse.json({ sub, payments, userId });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const sub = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { amount, paidAt, notes } = body;

  const payment = await prisma.subscriptionPayment.create({
    data: {
      subscriptionId: id,
      amount: Number(amount),
      paidAt: new Date(paidAt),
      notes: notes || null,
    },
  });

  return NextResponse.json(payment);
}
