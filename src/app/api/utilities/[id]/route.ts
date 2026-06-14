import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const utility = await prisma.utility.findFirst({
    where: { id, userId },
    include: { payments: { orderBy: { paidAt: "desc" } } },
  });
  if (!utility) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(utility);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const utility = await prisma.utility.findFirst({ where: { id, userId } });
  if (!utility) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, amountDue, dueDate, logoPath, notes } = body;

  const updated = await prisma.utility.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(amountDue !== undefined && { amountDue: Number(amountDue) }),
      ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
      ...(logoPath !== undefined && { logoPath: logoPath || null }),
      ...(notes !== undefined && { notes: notes || null }),
    },
  });

  if (amountDue !== undefined) {
    const agg = await prisma.utilityPayment.aggregate({
      where: { utilityId: id },
      _sum: { amount: true },
    });
    const totalPaid = agg._sum.amount || 0;
    const newStatus = totalPaid === 0 ? "UNPAID" : totalPaid < Number(amountDue) ? "PART_PAID" : "PAID";
    await prisma.utility.update({ where: { id }, data: { status: newStatus } });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const utility = await prisma.utility.findFirst({ where: { id, userId } });
  if (!utility) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.utility.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
