import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getPartnerIds(userId: string): Promise<string[]> {
  const links = await prisma.partnerLink.findMany({
    where: { OR: [{ sharerId: userId }, { viewerId: userId }] },
    select: { sharerId: true, viewerId: true },
  });
  return [...new Set(links.map((l) => (l.sharerId === userId ? l.viewerId : l.sharerId)))];
}

async function computeMetrics(plans: Array<{
  installments: Array<{ amount: number; dueDate: Date; status: string }>
  store?: { name: string } | null
}>) {
  const now = new Date();
  const in15 = new Date(now.getTime() + 15 * 86400000);
  const in30 = new Date(now.getTime() + 30 * 86400000);
  const in90 = new Date(now.getTime() + 90 * 86400000);

  let totalOwed = 0;
  let dueNext15 = 0;
  let dueNext30 = 0;
  let dueNext90 = 0;
  let overdueTotal = 0;
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;

  const upcomingMap = new Map<string, number>();
  const storeTotals = new Map<string, { count: number; totalValue: number }>();

  for (const plan of plans) {
    const storeName = plan.store?.name;
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

    if (storeName) {
      const prev = storeTotals.get(storeName) || { count: 0, totalValue: 0 };
      storeTotals.set(storeName, {
        count: prev.count + 1,
        totalValue: prev.totalValue + plan.installments.reduce((s, i) => s + i.amount, 0),
      });
    }
  }

  const upcomingPayments = Array.from(upcomingMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 30)
    .map(([date, amount]) => ({ date, amount }));

  const topStores = Array.from(storeTotals.entries())
    .map(([name, stats]) => ({ name, count: stats.count, totalValue: stats.totalValue }))
    .sort((a, b) => b.count - a.count);

  return {
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
    topStores,
  };
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const isSharedView = searchParams.get("shared") === "true";

  const ownPlans = await prisma.paymentPlan.findMany({
    where: { userId, status: "ACTIVE", archivedAt: null },
    include: { installments: true, store: { select: { name: true } }, user: { select: { id: true, name: true } } },
  });

  const own = await computeMetrics(ownPlans);

  if (!isSharedView) {
    return NextResponse.json({ ...own, sharedView: false });
  }

  const emptyPartnerMetrics = { totalOwed: 0, dueNext15: 0, dueNext30: 0, dueNext90: 0, overdueTotal: 0, activePlans: 0, paidCount: 0, pendingCount: 0, overdueCount: 0, upcomingPayments: [], topStores: [] };

  const partnerIds = await getPartnerIds(userId);
  if (partnerIds.length === 0) {
    return NextResponse.json({ ...own, sharedView: true, own, shared: emptyPartnerMetrics });
  }

  const sharedPlans = await prisma.paymentPlan.findMany({
    where: { userId: { in: partnerIds }, visibility: "SHARED", status: "ACTIVE", archivedAt: null },
    include: { installments: true, store: { select: { name: true } }, user: { select: { id: true, name: true } } },
  });

  const shared = await computeMetrics(sharedPlans);

  const topStoreMap = new Map<string, { count: number; totalValue: number }>();
  for (const s of [...own.topStores, ...shared.topStores]) {
    const prev = topStoreMap.get(s.name) || { count: 0, totalValue: 0 };
    topStoreMap.set(s.name, { count: prev.count + s.count, totalValue: prev.totalValue + s.totalValue });
  }
  const combinedTopStores = Array.from(topStoreMap.entries())
    .map(([name, stats]) => ({ name, count: stats.count, totalValue: stats.totalValue }))
    .sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalOwed: own.totalOwed + shared.totalOwed,
    dueNext15: own.dueNext15 + shared.dueNext15,
    dueNext30: own.dueNext30 + shared.dueNext30,
    dueNext90: own.dueNext90 + shared.dueNext90,
    overdueTotal: own.overdueTotal + shared.overdueTotal,
    activePlans: own.activePlans + shared.activePlans,
    paidCount: own.paidCount + shared.paidCount,
    pendingCount: own.pendingCount + shared.pendingCount,
    overdueCount: own.overdueCount + shared.overdueCount,
    topStores: combinedTopStores,
    own,
    shared,
    sharedView: true,
  });
}
