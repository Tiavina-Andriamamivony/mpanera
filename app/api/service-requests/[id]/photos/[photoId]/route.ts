import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; photoId: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.client) return unauthorized();
  const { id, photoId } = await params;

  const photo = await prisma.serviceRequestPhoto.findUnique({
    where: { id: photoId },
    include: { serviceRequest: true },
  });
  if (!photo || photo.serviceRequestId !== id) return notFound("Photo");
  if (photo.serviceRequest.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");

  await prisma.serviceRequestPhoto.delete({ where: { id: photoId } });
  return new NextResponse(null, { status: 204 });
}
