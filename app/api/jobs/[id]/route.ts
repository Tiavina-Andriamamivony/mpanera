import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      provider: true,
      serviceRequest: true,
      acceptedOffer: true,
      payment: true,
      review: true,
    },
  });
  if (!job) return notFound("Mission");
  const allowed =
    (user.client && job.clientId === user.client.id) ||
    (user.provider && job.providerId === user.provider.id);
  if (!allowed) return forbidden("Vous ne faites pas partie de cette mission");

  return NextResponse.json(job);
}
