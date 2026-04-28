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
      offers: true,
    },
  });
  if (!sr) return notFound("ServiceRequest");
  return NextResponse.json(sr);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Only clients can edit service requests");
  const { id } = await params;

  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("ServiceRequest");
  if (sr.clientId !== user.client.id) return forbidden("Not your request");
  if (sr.status !== "OPEN") return conflict("Request can only be edited while OPEN");

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
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Only clients can close service requests");
  const { id } = await params;
  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("ServiceRequest");
  if (sr.clientId !== user.client.id) return forbidden("Not your request");

  await prisma.serviceRequest.update({ where: { id }, data: { status: "CLOSED" } });
  return new NextResponse(null, { status: 204 });
}
