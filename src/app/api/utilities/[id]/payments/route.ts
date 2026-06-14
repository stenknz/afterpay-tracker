import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const utility = await prisma.utility.findFirst({ where: { id, userId } });
  if (!utility) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { amount, paidAt, notes } = body;

  const payment = await prisma.utilityPayment.create({
    data: {
      utilityId: id,
      amount: Number(amount),
      paidAt: new Date(paidAt),
      notes: notes || null,
    },
  });

  const agg = await prisma.utilityPayment.aggregate({
    where: { utilityId: id },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount || 0;
  const status = totalPaid === 0 ? "UNPAID" : totalPaid < utility.amountDue ? "PART_PAID" : "PAID";
  await prisma.utility.update({ where: { id }, data: { status } });

  return NextResponse.json(payment);
}
