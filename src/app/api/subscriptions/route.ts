import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const shared = searchParams.get("shared") === "true";

  const partnerIds: string[] = [];

  if (shared) {
    const given = await prisma.partnerLink.findMany({
      where: { sharerId: userId },
      select: { viewerId: true },
    });
    partnerIds.push(...given.map((p) => p.viewerId));
  }

  const ownWhere = { userId };
  const partnerWhere = shared && partnerIds.length > 0
    ? { userId: { in: partnerIds }, visibility: "SHARED" }
    : null;

  const [ownSubs, partnerSubs] = await Promise.all([
    prisma.subscription.findMany({
      where: ownWhere,
      orderBy: { name: "asc" },
    }),
    partnerWhere
      ? prisma.subscription.findMany({
          where: partnerWhere,
          include: { user: { select: { name: true, email: true } } },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const ownTotal = ownSubs.reduce((s, sub) => s + sub.price, 0);
  const partnerTotal = partnerSubs.reduce((s, sub) => s + sub.price, 0);

  return NextResponse.json({ own: ownSubs, partner: partnerSubs, ownTotal, partnerTotal });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, price, dayOfMonth, logoPath, visibility } = body;

  const sub = await prisma.subscription.create({
    data: {
      userId,
      name,
      price: Number(price),
      dayOfMonth: Number(dayOfMonth),
      logoPath: logoPath || null,
      visibility: visibility || "PRIVATE",
    },
  });

  return NextResponse.json(sub);
}
