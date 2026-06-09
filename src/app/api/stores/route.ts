import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const stores = await prisma.store.findMany({
    where: { userId },
    include: { _count: { select: { paymentPlans: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(stores);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { name, logoPath } = await req.json();
  const store = await prisma.store.create({ data: { name, logoPath, userId } });
  return NextResponse.json(store);
}
