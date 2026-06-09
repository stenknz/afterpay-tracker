import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const now = new Date();
  const in15 = new Date(now.getTime() + 15 * 86400000);
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in90 = new Date(now.getTime() + 90 * 86400000);

  const plans = await prisma.paymentPlan.findMany({
    where: { userId, status: "ACTIVE" },
    include: { installments: true },
  });

  let totalOwed = 0;
  let dueNext15 = 0;
  let dueNext30 = 0;
  let dueNext90 = 0;
  let overdueTotal = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  const upcomingMap = new Map<string, number>();

  for (const plan of plans) {
    for (const inst of plan.installments) {
      const due = new Date(inst.dueDate);
      if (inst.status === "PAID") {
        paidCount++;
        continue;
      }
      totalOwed += inst.amount;
      pendingCount++;
      if (due < now) {
        overdueTotal += inst.amount;
        overdueCount++;
        pendingCount--;
      }
      if (due >= now && due <= in15) dueNext15 += inst.amount;
      if (due >= now && due <= in30) dueNext30 += inst.amount;
      if (due >= now && due <= in90) dueNext90 += inst.amount;

      const key = due.toISOString().slice(0, 10);
      upcomingMap.set(key, (upcomingMap.get(key) || 0) + inst.amount);
    }
  }

  const upcomingPayments = Array.from(upcomingMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 30)
    .map(([date, amount]) => ({ date, amount }));

  return NextResponse.json({
    totalOwed,
    dueNext15,
    dueNext30,
    dueNext90,
    overdueTotal,
    activePlans: plans.length,
    paidCount,
    pendingCount,
    overdueCount,
    upcomingPayments,
  });
}
