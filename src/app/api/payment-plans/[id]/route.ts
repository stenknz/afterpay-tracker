import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateInstallments } from "@/lib/generate-installments";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const plan = await prisma.paymentPlan.findFirst({
    where: {
      id,
      OR: [
        { userId },
        {
          visibility: "SHARED",
          user: {
            OR: [
              { partnersGiven: { some: { viewerId: userId } } },
              { partnersRecv: { some: { sharerId: userId } } },
            ],
          },
        },
      ],
    },
    include: { store: true, vendor: true, installments: { orderBy: { dueDate: "asc" } } },
  });
  if (!plan) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(plan);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { storeId, vendorId, totalAmount, installmentAmount, frequency, startDate, title, notes, status, visibility } = body;

  // Preserve paid installments, only delete unpaid ones
  const existing = await prisma.paymentInstallment.findMany({
    where: { paymentPlanId: id },
    orderBy: { dueDate: "asc" },
  });

  const paidCount = existing.filter((i) => i.status === "PAID").length;
  const unpaidIds = existing.filter((i) => i.status !== "PAID").map((i) => i.id);

  if (unpaidIds.length > 0) {
    await prisma.paymentInstallment.deleteMany({ where: { id: { in: unpaidIds } } });
  }

  const allInstallments = generateInstallments(
    Number(totalAmount),
    Number(installmentAmount),
    frequency,
    new Date(startDate)
  );

  // Create only installments beyond what's already paid
  const newInstallments = allInstallments.slice(paidCount);

  const plan = await prisma.paymentPlan.update({
    where: { id, userId },
    data: {
      storeId: storeId || null,
      vendorId: vendorId || null,
      totalAmount: Number(totalAmount),
      installmentAmount: Number(installmentAmount),
      frequency,
      startDate: new Date(startDate),
      title,
      notes,
      visibility: visibility || "PRIVATE",
      status: status || "ACTIVE",
      installments: {
        create: newInstallments.map((i) => ({
          amount: i.amount,
          dueDate: i.dueDate,
          status: i.status,
        })),
      },
    },
    include: { store: true, vendor: true, installments: { orderBy: { dueDate: "asc" } } },
  });

  return NextResponse.json(plan);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.paymentPlan.delete({
    where: { id, userId: (session.user as { id: string }).id },
  });
  return NextResponse.json({ success: true });
}
