import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, hashPassword, verifyPassword } from "@/lib/auth";
import { conflict, errorResponse, parseJson, unauthorized } from "@/lib/api-error";
import { updateUserSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const result = await parseJson(req, updateUserSchema);
  if ("response" in result) return result.response;
  const { email, phone, currentPassword, newPassword } = result.data;

  if (newPassword) {
    if (!currentPassword || !(await verifyPassword(currentPassword, user.passwordHash))) {
      return errorResponse(401, "INVALID_CREDENTIALS", "Le mot de passe actuel est incorrect");
    }
  }

  if (email && email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email } });
    if (taken) return conflict("Cette adresse email est deja utilisee");
  }
  if (phone && phone !== user.phone) {
    const taken = await prisma.user.findUnique({ where: { phone } });
    if (taken) return conflict("Ce numero de telephone est deja utilise");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(email && { email }),
      ...(phone && { phone }),
      ...(newPassword && { passwordHash: await hashPassword(newPassword) }),
    },
  });
  return NextResponse.json(updated);
}
