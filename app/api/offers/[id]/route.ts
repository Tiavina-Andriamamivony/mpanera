import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { updateOfferSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { provider: true, proposedSlots: true },
  });
  if (!offer) return notFound("Offre");
  return NextResponse.json(offer);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.provider) return unauthorized();
  const { id } = await params;

  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer) return notFound("Offre");
  if (offer.providerId !== user.provider.id) return forbidden("Cette offre ne vous appartient pas");
  if (offer.status !== "PENDING") return conflict("L'offre ne peut etre modifiee que lorsqu'elle est en attente");

  const result = await parseJson(req, updateOfferSchema);
  if ("response" in result) return result.response;
  const { slots, ...rest } = result.data;

  const updated = await prisma.$transaction(async (tx) => {
    if (slots) {
      await tx.proposedTimeSlot.deleteMany({ where: { offerId: id } });
      await tx.proposedTimeSlot.createMany({
        data: slots.map((s) => ({ ...s, offerId: id })),
      });
    }
    return tx.offer.update({
      where: { id },
      data: rest,
      include: { proposedSlots: true },
    });
  });
  return NextResponse.json(updated);
}
