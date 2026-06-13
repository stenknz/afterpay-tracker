import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { generateInstallments } from "@/lib/generate-installments";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const storeId = searchParams.get("storeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  if (storeId) where.storeId = storeId;

  const plans = await prisma.paymentPlan.findMany({
    where,
    include: {
      store: true,
      vendor: true,
      installments: { orderBy: { dueDate: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  let filtered = plans;

  if (from || to) {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    filtered = plans.filter((p) =>
      p.installments.some((i) => {
        if (fromDate && i.dueDate < fromDate) return false;
        if (toDate && i.dueDate > toDate) return false;
        return true;
      })
    );
  }

  return NextResponse.json(filtered);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { storeId, vendorId, totalAmount, installmentAmount, frequency, startDate, title, visibility, notes } = body;

  const installments = generateInstallments(
    Number(totalAmount),
    Number(installmentAmount),
    frequency,
    new Date(startDate)
  );

  const plan = await prisma.paymentPlan.create({
    data: {
      userId,
      storeId: storeId || null,
      vendorId: vendorId || null,
      totalAmount: Number(totalAmount),
      installmentAmount: Number(installmentAmount),
      frequency,
      startDate: new Date(startDate),
      title,
      visibility: visibility || "PRIVATE",
      notes,
      installments: {
        create: installments.map((i) => ({
          amount: i.amount,
          dueDate: i.dueDate,
          status: i.status,
        })),
      },
    },
    include: { store: true, vendor: true, installments: true },
  });

  return NextResponse.json(plan);
}
