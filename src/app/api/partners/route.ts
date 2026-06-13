import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;

  const [given, received] = await Promise.all([
    prisma.partnerLink.findMany({
      where: { sharerId: userId },
      include: { viewer: { select: { id: true, name: true, email: true } } },
    }),
    prisma.partnerLink.findMany({
      where: { viewerId: userId },
      include: { sharer: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  return NextResponse.json({
    sharingWith: given.map((l) => ({ id: l.id, user: l.viewer })),
    sharedBy: received.map((l) => ({ id: l.id, user: l.sharer })),
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { email } = await req.json();

  if (!email || email === session.user.email) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const partner = await prisma.user.findUnique({ where: { email } });
  if (!partner) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const existing = await prisma.partnerLink.findUnique({
    where: { sharerId_viewerId: { sharerId: userId, viewerId: partner.id } },
  });
  if (existing) {
    return NextResponse.json({ error: "Already sharing with this user" }, { status: 409 });
  }

  const [link] = await Promise.all([
    prisma.partnerLink.create({
      data: { sharerId: userId, viewerId: partner.id },
      include: { viewer: { select: { id: true, name: true, email: true } } },
    }),
    prisma.partnerLink.upsert({
      where: { sharerId_viewerId: { sharerId: partner.id, viewerId: userId } },
      create: { sharerId: partner.id, viewerId: userId },
      update: {},
    }),
  ]);

  return NextResponse.json({ id: link.id, user: link.viewer });
}
