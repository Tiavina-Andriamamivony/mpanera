import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { badRequest, forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Only clients can upload photos");
  const { id } = await params;

  const sr = await prisma.serviceRequest.findUnique({ where: { id } });
  if (!sr) return notFound("Demande de service");
  if (sr.clientId !== user.client.id) return forbidden("Cette demande ne vous appartient pas");

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return badRequest("Fichier manquant");
  const orderRaw = form.get("order");
  const order = typeof orderRaw === "string" ? Number.parseInt(orderRaw, 10) : 0;

  // TODO: upload to object storage. For now, persist a placeholder URL.
  const fileUrl = `/uploads/service-requests/${id}/${randomUUID()}-${file.name}`;

  const photo = await prisma.serviceRequestPhoto.create({
    data: { serviceRequestId: id, fileUrl, order: Number.isFinite(order) ? order : 0 },
  });
  return NextResponse.json(photo, { status: 201 });
}
