import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const installment = await prisma.paymentInstallment.findUnique({
    where: { id },
    include: { paymentPlan: true },
  });

  if (!installment || installment.paymentPlan.userId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.paymentInstallment.update({
    where: { id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  if (status === "PAID") {
    const [allInstallments] = await prisma.$transaction([
      prisma.paymentInstallment.findMany({
        where: { paymentPlanId: installment.paymentPlanId },
      }),
    ]);
    const allPaid = allInstallments.every((i) => i.status === "PAID");
    if (allPaid && installment.paymentPlan.status !== "COMPLETED") {
      await prisma.paymentPlan.update({
        where: { id: installment.paymentPlanId },
        data: { status: "COMPLETED" },
      });
    }
  }

  return NextResponse.json(updated);
}
