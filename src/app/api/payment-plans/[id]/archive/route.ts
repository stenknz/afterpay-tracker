import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const plan = await prisma.paymentPlan.findUnique({
    where: { id },
    include: { installments: true },
  });

  if (!plan || plan.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (plan.archivedAt) {
    return NextResponse.json({ error: "Already archived" }, { status: 400 });
  }

  const allPaid = plan.installments.every((i) => i.status === "PAID");
  if (!allPaid) {
    return NextResponse.json({ error: "All installments must be paid before archiving" }, { status: 400 });
  }

  const updated = await prisma.paymentPlan.update({
    where: { id },
    data: { archivedAt: new Date() },
  });

  return NextResponse.json(updated);
}
