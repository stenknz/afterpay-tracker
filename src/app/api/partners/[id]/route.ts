import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const link = await prisma.partnerLink.findFirst({
    where: { id, sharerId: userId },
  });

  if (!link) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.partnerLink.delete({ where: { id } }),
    prisma.partnerLink.deleteMany({ where: { sharerId: link.viewerId, viewerId: userId } }),
  ]);

  return NextResponse.json({ success: true });
}
