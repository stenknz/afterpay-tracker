import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const userId = (session.user as { id: string }).id;
  const body = await req.json();
  const { name, price, dayOfMonth, logoPath, visibility } = body;

  const sub = await prisma.subscription.update({
    where: { id, userId },
    data: {
      name,
      price: Number(price),
      dayOfMonth: Number(dayOfMonth),
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
