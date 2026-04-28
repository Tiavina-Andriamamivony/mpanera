import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "@/lib/api-error";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true, parent: true },
  });
  if (!category) return notFound("Categorie");
  return NextResponse.json(category);
}
