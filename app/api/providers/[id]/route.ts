import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/api-error";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const provider = await prisma.provider.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      reviews: { where: { published: true }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!provider) return notFound("Prestataire");
  return NextResponse.json({
    ...provider,
    categories: provider.categories.map((pc) => pc.category),
  });
}
