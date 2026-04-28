import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { badRequest, conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { acceptOfferSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.client) return unauthorized();
  const { id } = await params;

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: { serviceRequest: true, proposedSlots: true },
  });
  if (!offer) return notFound("Offre");
  if (offer.serviceRequest.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");
  if (offer.status !== "PENDING") return conflict("L'offre n'est pas en attente");
  if (offer.serviceRequest.status === "CLOSED" || offer.serviceRequest.status === "EXPIRED") {
    return conflict("La demande n'est plus active");
  }

  const result = await parseJson(req, acceptOfferSchema);
  if ("response" in result) return result.response;
  const { chosenSlotStart, chosenSlotEnd } = result.data;

  const selectedSlot = offer.proposedSlots.some(
    (slot) =>
      slot.start.getTime() === chosenSlotStart.getTime() &&
      slot.end.getTime() === chosenSlotEnd.getTime(),
  );
  if (!selectedSlot) {
    return badRequest("Le creneau choisi doit correspondre a l'un des creneaux proposes par le prestataire");
  }

  const job = await prisma.$transaction(async (tx) => {
    const existingJob = await tx.job.findUnique({
      where: { serviceRequestId: offer.serviceRequestId },
    });
    if (existingJob) throw new Error("JOB_ALREADY_EXISTS");

    const newJob = await tx.job.create({
      data: {
        serviceRequestId: offer.serviceRequestId,
        clientId: user.client!.id,
        providerId: offer.providerId,
        acceptedOfferId: offer.id,
        finalPrice: offer.proposedPrice,
        chosenSlotStart,
        chosenSlotEnd,
      },
    });
    await tx.offer.update({ where: { id }, data: { status: "ACCEPTED" } });
    await tx.offer.updateMany({
      where: {
        serviceRequestId: offer.serviceRequestId,
        id: { not: id },
        status: "PENDING",
      },
      data: { status: "REFUSED" },
    });
    await tx.notification.updateMany({
      where: {
        serviceRequestId: offer.serviceRequestId,
        providerId: { not: offer.providerId },
        status: { in: ["SENT", "VIEWED"] },
      },
      data: { status: "IGNORED" },
    });
    await tx.serviceRequest.update({
      where: { id: offer.serviceRequestId },
      data: { status: "ASSIGNED" },
    });
    return newJob;
  });

  return NextResponse.json(job, { status: 201 });
}
