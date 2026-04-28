import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueTokens, verifyPassword } from "@/lib/auth";
import { errorResponse, parseJson } from "@/lib/api-error";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const result = await parseJson(req, loginSchema);
  if ("response" in result) return result.response;
  const { email, phone, password } = result.data;

  const user = await prisma.user.findFirst({
    where: email ? { email } : { phone: phone! },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return errorResponse(401, "INVALID_CREDENTIALS", "Email/telephone ou mot de passe invalide");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = issueTokens(user.id);
  return NextResponse.json({ ...tokens, user });
}
