import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { createOfferSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Only clients can list offers");
  const { id } = await params;

  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("Demande de service");
  if (sr.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");

  const offers = await prisma.offer.findMany({
    where: { serviceRequestId: id },
    include: { provider: true, proposedSlots: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(offers);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("Only providers can create offers");
  const { id } = await params;

  const result = await parseJson(req, createOfferSchema);
  if ("response" in result) return result.response;
  const { proposedPrice, message, slots } = result.data;

  const serviceRequest = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!serviceRequest) return notFound("Demande de service");
  if (serviceRequest.status !== "OPEN" && serviceRequest.status !== "NEGOTIATING") {
    return conflict("La demande n'accepte plus d'offres");
  }

  const notification = await prisma.notification.findFirst({
    where: { serviceRequestId: id, providerId: user.provider.id },
  });
  if (!notification) return forbidden("Le prestataire n'a pas ete notifie pour cette demande");

  const existing = await prisma.offer.findUnique({
    where: { notificationId: notification.id },
  });
  if (existing) return conflict("Une offre existe deja pour cette notification");

  const offer = await prisma.offer.create({
    data: {
      notificationId: notification.id,
      serviceRequestId: id,
      providerId: user.provider.id,
      proposedPrice,
      message,
      proposedSlots: { create: slots },
    },
    include: { proposedSlots: true },
  });

  await prisma.notification.update({
    where: { id: notification.id },
    data: { status: "RESPONDED" },
  });

  if (serviceRequest.status === "OPEN") {
    await prisma.serviceRequest.update({
      where: { id },
      data: { status: "NEGOTIATING" },
    });
  }

  return NextResponse.json(offer, { status: 201 });
}
