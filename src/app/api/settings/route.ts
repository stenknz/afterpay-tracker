import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const settings = await prisma.appSetting.findUnique({ where: { id: "site" } });
  return NextResponse.json(settings || { id: "site", logoPath: null });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { logoPath } = body;

  const settings = await prisma.appSetting.upsert({
    where: { id: "site" },
    update: { logoPath },
    create: { id: "site", logoPath },
  });

  return NextResponse.json(settings);
}
