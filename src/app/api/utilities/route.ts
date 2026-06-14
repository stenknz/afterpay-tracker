import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function recalcStatus(utilityId: string) {
  const agg = await prisma.utilityPayment.aggregate({
    where: { utilityId },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount || 0;
  const utility = await prisma.utility.findUnique({ where: { id: utilityId } });
  if (!utility) return;
  const status = totalPaid === 0 ? "UNPAID" : totalPaid < utility.amountDue ? "PART_PAID" : "PAID";
  await prisma.utility.update({ where: { id: utilityId }, data: { status } });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const utilities = await prisma.utility.findMany({
    where: { userId },
    include: { payments: { orderBy: { paidAt: "desc" } } },
    orderBy: { dueDate: "desc" },
  });

  const now = new Date();
  const totalDue = utilities.filter((u) => u.status !== "PAID").reduce((s, u) => s + u.amountDue, 0);
  const totalPaid = utilities.reduce((s, u) => s + u.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const remaining = totalDue - totalPaid;
  const activeCount = utilities.filter((u) => u.status !== "PAID").length;
  const overdueCount = utilities.filter((u) => u.status !== "PAID" && new Date(u.dueDate) < now).length;

  return NextResponse.json({ utilities, totalDue, totalPaid, remaining, activeCount, overdueCount });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, amountDue, dueDate, logoPath, notes } = body;

  const utility = await prisma.utility.create({
    data: {
      userId,
      name,
      amountDue: Number(amountDue),
      dueDate: new Date(dueDate),
      logoPath: logoPath || null,
      notes: notes || null,
    },
  });

  return NextResponse.json(utility);
}
