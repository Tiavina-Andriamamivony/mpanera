import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.provider) return unauthorized();
  const { id } = await params;

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return notFound("Offre");
  if (offer.providerId !== user.provider.id) return forbidden("Cette offre ne vous appartient pas");
  if (offer.status !== "PENDING") return conflict("L'offre n'est pas en attente");

  const updated = await prisma.offer.update({
    where: { id },
    data: { status: "WITHDRAWN" },
  });
  return NextResponse.json(updated);
}
