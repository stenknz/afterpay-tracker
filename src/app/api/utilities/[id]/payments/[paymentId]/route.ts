import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, paymentId } = await params;
  const userId = (session.user as { id: string }).id;

  const utility = await prisma.utility.findFirst({ where: { id, userId } });
  if (!utility) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.utilityPayment.delete({ where: { id: paymentId } });

  const agg = await prisma.utilityPayment.aggregate({
    where: { utilityId: id },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount || 0;
  const status = totalPaid === 0 ? "UNPAID" : totalPaid < utility.amountDue ? "PART_PAID" : "PAID";
  await prisma.utility.update({ where: { id }, data: { status } });

  return NextResponse.json({ success: true });
}
