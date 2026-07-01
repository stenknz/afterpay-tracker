import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const VALID_BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "BI_ANNUAL", "YEARLY"];

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, price, dayOfMonth, billingCycle, logoPath, visibility } = body;

  const cycle = billingCycle || "MONTHLY";
  if (!VALID_BILLING_CYCLES.includes(cycle)) {
    return NextResponse.json({ error: "Invalid billing cycle" }, { status: 400 });
  }

  const sub = await prisma.subscription.update({
    where: { id, userId },
    data: {
      name,
      price: Number(price),
      dayOfMonth: Number(dayOfMonth),
      billingCycle: cycle,
      logoPath: logoPath || null,
      visibility: visibility || "PRIVATE",
    },
  });

  return NextResponse.json(sub);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  await prisma.subscription.delete({ where: { id, userId } });
  return NextResponse.json({ success: true });
}
