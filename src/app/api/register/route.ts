import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }
  const hashedPassword = await hash(password, 12);
  const user = await prisma.user.create({ data: { name, email, hashedPassword } });
  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}
