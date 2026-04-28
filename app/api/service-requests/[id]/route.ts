import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { updateServiceRequestSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;
  const sr = await prisma.serviceRequest.findUnique({
    where: { id },
    include: {
      client: true,
      category: true,
      photos: { orderBy: { order: "asc" } },
      offers: user.client
        ? true
        : user.provider
          ? { where: { providerId: user.provider.id } }
          : false,
    },
  });
  if (!sr) return notFound("Demande de service");

  const allowed =
    (user.client && sr.clientId === user.client.id) ||
    (user.provider &&
      (await prisma.notification.count({
        where: { serviceRequestId: id, providerId: user.provider.id },
      })) > 0);
  if (!allowed) return forbidden("Vous n'etes pas autorise a consulter cette demande");

  return NextResponse.json(sr);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.client) return unauthorized();
  const { id } = await params;

  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("Demande de service");
  if (sr.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");
  if (sr.status !== "OPEN") return conflict("La demande ne peut etre modifiee que lorsqu'elle est OUVERTE");

  const result = await parseJson(req, updateServiceRequestSchema);
  if ("response" in result) return result.response;

  const updated = await prisma.serviceRequest.update({
    where: { id },
    data: result.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.client) return unauthorized();
  const { id } = await params;
  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("Demande de service");
  if (sr.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");

  await prisma.serviceRequest.update({ where: { id }, data: { status: "CLOSED" } });
  return new NextResponse(null, { status: 204 });
}
