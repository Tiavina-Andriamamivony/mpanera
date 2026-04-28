import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuery } from "@/lib/api-error";
import { providerSearchSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const result = parseQuery(new URL(req.url), providerSearchSchema);
  if ("response" in result) return result.response;
  const { page, perPage, categoryId, city, district, verified, minRating } = result.data;

  const where = {
    ...(city && { city }),
    ...(district && { district }),
    ...(verified !== undefined && { verified }),
    ...(minRating !== undefined && { averageRating: { gte: minRating } }),
    ...(categoryId && { categories: { some: { categoryId } } }),
  };

  const [data, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: [{ verified: "desc" }, { averageRating: "desc" }],
      include: {
        categories: { include: { category: true } },
      },
    }),
    prisma.provider.count({ where }),
  ]);
  return NextResponse.json({
    data: data.map((provider) => ({
      ...provider,
      categories: provider.categories.map((providerCategory) => providerCategory.category),
    })),
    page,
    perPage,
    total,
  });
}
