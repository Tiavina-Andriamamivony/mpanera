import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, parseJson, unauthorized } from "@/lib/api-error";
import { completeProviderSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (user.role !== "PROVIDER")
    return forbidden("Seuls les utilisateurs PROVIDER peuvent terminer l'onboarding prestataire");
  if (user.provider) return conflict("Le profil prestataire existe deja");

  const result = await parseJson(req, completeProviderSchema);
  if ("response" in result) return result.response;
  const { categoryIds, ...rest } = result.data;

  const provider = await prisma.provider.create({
    data: {
      userId: user.id,
      ...rest,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingComplete: true },
  });
  return NextResponse.json(provider);
}
