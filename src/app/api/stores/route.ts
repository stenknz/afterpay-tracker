import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stores = await prisma.store.findMany({
    include: { _count: { select: { paymentPlans: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(stores);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, logoPath } = await req.json();

  const normalized = name.trim().toLowerCase();
  const all = await prisma.store.findMany({ select: { id: true, name: true, userId: true } });
  const dup = all.find((s) => s.name.trim().toLowerCase() === normalized);
  if (dup) {
    return NextResponse.json(dup);
  }

  const userId = (session.user as { id: string }).id;
  const store = await prisma.store.create({ data: { name: name.trim(), logoPath, userId } });
  return NextResponse.json(store);
}
