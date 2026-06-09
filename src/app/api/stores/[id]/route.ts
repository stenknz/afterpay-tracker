import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { name, logoPath } = await req.json();
  const store = await prisma.store.update({
    where: { id, userId: (session.user as { id: string }).id },
    data: { name, logoPath },
  });
  return NextResponse.json(store);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.store.delete({
    where: { id, userId: (session.user as { id: string }).id },
  });
  return NextResponse.json({ success: true });
}
