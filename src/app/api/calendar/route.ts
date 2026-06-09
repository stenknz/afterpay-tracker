import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(0).toISOString();
  const to = searchParams.get("to") || new Date(Date.now() + 365 * 86400000).toISOString();

  const installments = await prisma.paymentInstallment.findMany({
    where: {
      paymentPlan: { userId },
      dueDate: { gte: new Date(from), lte: new Date(to) },
    },
    include: {
      paymentPlan: { include: { store: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const events = installments.map((inst) => {
    const now = new Date();
    const isOverdue = inst.status === "PENDING" && new Date(inst.dueDate) < now;
    const color = inst.status === "PAID" ? "#22c55e" : isOverdue ? "#C04740" : "#F6B45F";

    return {
      id: inst.id,
      title: `${inst.paymentPlan.store?.name || "Payment"} - $${inst.amount.toFixed(2)}`,
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
      },
    };
  });

  return NextResponse.json(events);
}
