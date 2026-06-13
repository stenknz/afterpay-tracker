import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as { id: string }).id;
  const body = await req.json();

  const data: Record<string, string> = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.avatarPath === "string") data.avatarPath = body.avatarPath;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, avatarPath: true },
  });

  return NextResponse.json(user);
}
