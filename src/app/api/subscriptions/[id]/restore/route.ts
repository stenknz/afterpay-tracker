import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;

  const sub = await prisma.subscription.findUnique({ where: { id } });

  if (!sub || sub.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!sub.archivedAt) {
    return NextResponse.json({ error: "Subscription is not archived" }, { status: 400 });
  }

  const updated = await prisma.subscription.update({
    where: { id },
    data: { archivedAt: null },
  });

  return NextResponse.json(updated);
}
