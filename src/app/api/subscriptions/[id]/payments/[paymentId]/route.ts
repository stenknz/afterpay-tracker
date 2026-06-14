import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, paymentId } = await params;
  const userId = (session.user as { id: string }).id;

  const sub = await prisma.subscription.findFirst({ where: { id, userId } });
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.subscriptionPayment.delete({ where: { id: paymentId } });
  return NextResponse.json({ success: true });
}
