import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, issueTokens } from "@/lib/auth";
import { conflict, parseJson } from "@/lib/api-error";
import { registerSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const result = await parseJson(req, registerSchema);
  if ("response" in result) return result.response;
  const { email, phone, password, role } = result.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone }] },
  });
  if (existing) return conflict("Cette adresse email ou ce numero de telephone est deja utilise");

  const user = await prisma.user.create({
    data: { email, phone, role, passwordHash: await hashPassword(password) },
  });
  const tokens = issueTokens(user.id);
  return NextResponse.json({ ...tokens, user }, { status: 201 });
}
