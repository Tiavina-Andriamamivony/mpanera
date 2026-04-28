import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { updateJobStatusSchema } from "@/lib/validation";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return notFound("Mission");
  const allowed =
    (user.client && job.clientId === user.client.id) ||
    (user.provider && job.providerId === user.provider.id);
  if (!allowed) return forbidden("Vous ne faites pas partie de cette mission");

  const result = await parseJson(req, updateJobStatusSchema);
  if ("response" in result) return result.response;
  const { status } = result.data;

  const updated = await prisma.job.update({
    where: { id },
    data: {
      status,
      ...(status === "COMPLETED" && { completedAt: new Date() }),
    },
  });

  if (status === "COMPLETED") {
    const stats = await prisma.review.aggregate({
      where: { providerId: job.providerId, published: true },
      _avg: { rating: true },
    });
    await prisma.provider.update({
      where: { id: job.providerId },
      data: {
        completedJobsCount: { increment: 1 },
        averageRating: stats._avg.rating ?? 0,
      },
    });
  }
  return NextResponse.json(updated);
}
