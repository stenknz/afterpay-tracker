import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateDatesInRange } from "@/lib/subscription-dates";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(0).toISOString();
  const to = searchParams.get("to") || new Date(Date.now() + 365 * 86400000).toISOString();

  const partnerLinks = await prisma.partnerLink.findMany({
    where: { OR: [{ sharerId: userId }, { viewerId: userId }] },
    select: { sharerId: true, viewerId: true },
  });
  const partnerIds = [...new Set(partnerLinks.map((l) => (l.sharerId === userId ? l.viewerId : l.sharerId)))];

  const installments = await prisma.paymentInstallment.findMany({
    where: {
      paymentPlan: {
        OR: [
          { userId, archivedAt: null },
          ...(partnerIds.length > 0
            ? [{ userId: { in: partnerIds }, visibility: "SHARED", archivedAt: null }]
            : []),
        ],
      },
      dueDate: { gte: new Date(from), lte: new Date(to) },
    },
    include: {
      paymentPlan: { include: { store: true, user: { select: { name: true, email: true } } } },
    },
    orderBy: { dueDate: "asc" },
  });

  const events = installments.map((inst) => {
    const now = new Date();
    const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < now;
    const isOwn = inst.paymentPlan.userId === userId;
    const color = inst.status === "PAID" ? "#22c55e" : isOverdue ? "#C04740" : isOwn ? "#71352E" : "#E88C5E";
    const userName = inst.paymentPlan.user.name || inst.paymentPlan.user.email || "Unknown";

    return {
      id: inst.id,
      title: `${inst.paymentPlan.store?.name || "Payment"} - $${inst.amount.toFixed(2)}${!isOwn ? ` (${userName})` : ""}`,
      start: inst.dueDate.toISOString(),
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      textColor: "#fff",
      extendedProps: {
        status: isOverdue ? "OVERDUE" : inst.status,
        amount: inst.amount,
        planId: inst.paymentPlanId,
        storeName: inst.paymentPlan.store?.name || "Untitled",
        userName: isOwn ? undefined : userName,
        isOwn,
      },
    };
  });

  // --- Utilities (own + partner shared) ---
  const ownUtilities = await prisma.utility.findMany({
    where: { userId, dueDate: { gte: new Date(from), lte: new Date(to) } },
    include: { payments: true },
    orderBy: { dueDate: "asc" },
  });
  const partnerUtilities = partnerIds.length > 0
    ? await prisma.utility.findMany({
        where: { userId: { in: partnerIds }, visibility: "SHARED", dueDate: { gte: new Date(from), lte: new Date(to) } },
        include: { payments: true, user: { select: { name: true, email: true } } },
        orderBy: { dueDate: "asc" },
      })
    : [];

  const utilityEvents = [...ownUtilities, ...partnerUtilities].map((util) => {
    const totalPaid = util.payments.reduce((s, p) => s + p.amount, 0);
    const isPast = new Date(util.dueDate) < new Date();
    const isOwn = "user" in util && (util as any).user
      ? (util as any).user.name || (util as any).user.email
      : null;
    const color = util.status === "PAID" ? "#22c55e"
      : util.status === "PART_PAID" ? "#FF9500"
      : isPast ? "#C04740"
      : "#3B82F6";
    const ownerName = (util as any).user?.name || (util as any).user?.email || null;

    return {
      id: util.id,
      title: `${util.name} - $${util.amountDue.toFixed(2)}${ownerName ? ` (${ownerName})` : ""}`,
      start: util.dueDate.toISOString(),
      allDay: true,
      backgroundColor: color,
      borderColor: color,
      textColor: "#fff",
      extendedProps: {
        type: "utility",
        status: util.status,
        amount: util.amountDue,
        totalPaid,
        utilityId: util.id,
        storeName: util.name,
        isOwn: !ownerName,
        userName: ownerName,
      },
    };
  });

  // --- Subscriptions (own, with paid status) ---
  const ownSubscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: { payments: { orderBy: { paidAt: "asc" } } },
  });
  const partnerSubscriptions = partnerIds.length > 0
    ? await prisma.subscription.findMany({
        where: { userId: { in: partnerIds }, visibility: "SHARED" },
        include: { payments: { orderBy: { paidAt: "asc" } }, user: { select: { name: true, email: true } } },
      })
    : [];

  const subEvents: Record<string, unknown>[] = [];
  for (const sub of [...ownSubscriptions, ...partnerSubscriptions]) {
    const isPartner = "user" in sub && (sub as any).user;
    const ownerName = isPartner ? ((sub as any).user?.name || (sub as any).user?.email) : null;
    const dates = generateDatesInRange(sub.dayOfMonth, sub.startDate, new Date(from), new Date(to), (sub as any).billingCycle || "MONTHLY");
    const sortedPayments = sub.payments;
    let payIdx = 0;

    for (const d of dates) {
      const prevDue = new Date(d);
      prevDue.setMonth(prevDue.getMonth() - 1);
      let paid = false;
      for (; payIdx < sortedPayments.length; payIdx++) {
        const payDate = new Date(sortedPayments[payIdx].paidAt);
        if (payDate > prevDue && payDate <= d) {
          paid = true;
          payIdx++;
          break;
        }
        if (payDate > d) break;
      }

      subEvents.push({
        id: `${sub.id}-${d.getTime()}`,
        title: `${sub.name} - $${sub.price.toFixed(2)}${ownerName ? ` (${ownerName})` : ""}`,
        start: d.toISOString(),
        allDay: true,
        backgroundColor: paid ? "#22c55e" : "#6366F1",
        borderColor: paid ? "#22c55e" : "#6366F1",
        textColor: "#fff",
        extendedProps: {
          type: "subscription",
          status: paid ? "PAID" : "PENDING",
          amount: sub.price,
          subscriptionId: sub.id,
          storeName: sub.name,
          isOwn: !ownerName,
          userName: ownerName,
        },
      });
    }
  }

  const allEvents = [...events, ...utilityEvents, ...subEvents];
  return NextResponse.json(allEvents);
}
