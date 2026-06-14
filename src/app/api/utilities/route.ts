import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function recalcStatus(utilityId: string) {
  const agg = await prisma.utilityPayment.aggregate({
    where: { utilityId },
    _sum: { amount: true },
  });
  const totalPaid = agg._sum.amount || 0;
  const utility = await prisma.utility.findUnique({ where: { id: utilityId } });
  if (!utility) return;
  const status = totalPaid === 0 ? "UNPAID" : totalPaid < utility.amountDue ? "PART_PAID" : "PAID";
  await prisma.utility.update({ where: { id: utilityId }, data: { status } });
}

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

  const [ownUtilities, partnerUtilities] = await Promise.all([
    prisma.utility.findMany({
      where: ownWhere,
      include: { payments: { orderBy: { paidAt: "desc" } } },
      orderBy: { dueDate: "desc" },
    }),
    partnerWhere
      ? prisma.utility.findMany({
          where: partnerWhere,
          include: {
            payments: { orderBy: { paidAt: "desc" } },
            user: { select: { name: true, email: true } },
          },
          orderBy: { dueDate: "desc" },
        })
      : Promise.resolve([]),
  ]);

  const now = new Date();
  const allUtilities = [...ownUtilities, ...partnerUtilities];
  const totalDue = ownUtilities.filter((u) => u.status !== "PAID").reduce((s, u) => s + u.amountDue, 0);
  const totalPaid = ownUtilities.reduce((s, u) => s + u.payments.reduce((ps, p) => ps + p.amount, 0), 0);
  const remaining = totalDue - totalPaid;
  const activeCount = ownUtilities.filter((u) => u.status !== "PAID").length;
  const overdueCount = ownUtilities.filter((u) => u.status !== "PAID" && new Date(u.dueDate) < now).length;
  const partnerTotalDue = partnerUtilities.filter((u) => u.status !== "PAID").reduce((s, u) => s + u.amountDue, 0);

  return NextResponse.json({ utilities: allUtilities, own: ownUtilities, partner: partnerUtilities, totalDue, totalPaid, remaining, activeCount, overdueCount, partnerTotalDue });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, amountDue, dueDate, logoPath, notes, visibility } = body;

  const utility = await prisma.utility.create({
    data: {
      userId,
      name,
      amountDue: Number(amountDue),
      dueDate: new Date(dueDate),
      logoPath: logoPath || null,
      notes: notes || null,
      visibility: visibility || "PRIVATE",
    },
  });

  return NextResponse.json(utility);
}
