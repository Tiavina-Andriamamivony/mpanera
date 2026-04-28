import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, parseJson, unauthorized } from "@/lib/api-error";
import { completeClientSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.role !== "CLIENT") return forbidden("Seuls les utilisateurs CLIENT peuvent terminer l'onboarding client");
  if (user.client) return conflict("Le profil client existe deja");

  const result = await parseJson(req, completeClientSchema);
  if ("response" in result) return result.response;

  const client = await prisma.client.create({
    data: { userId: user.id, ...result.data },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingComplete: true },
  });
  return NextResponse.json(client, { status: 201 });
}
