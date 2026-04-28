import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, parseJson, unauthorized } from "@/lib/api-error";
import { updateProviderCategoriesSchema } from "@/lib/validation";

export async function PUT(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("L'appelant n'est pas un prestataire");

  const result = await parseJson(req, updateProviderCategoriesSchema);
  if ("response" in result) return result.response;

  const { categoryIds } = result.data;
  await prisma.$transaction([
    prisma.providerCategory.deleteMany({ where: { providerId: user.provider.id } }),
    prisma.providerCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        providerId: user.provider!.id,
        categoryId,
      })),
    }),
  ]);

  const updated = await prisma.provider.findUnique({ where: { id: user.provider.id } });
  return NextResponse.json(updated);
}
