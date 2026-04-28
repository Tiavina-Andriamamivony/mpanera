import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { createReviewSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user || !user.client) return unauthorized();
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, include: { review: true } });
  if (!job) return notFound("Mission");
  if (job.clientId !== user.client.id) return forbidden("Cette mission ne vous appartient pas");
  if (job.status !== "COMPLETED") return conflict("Seules les missions terminees peuvent etre evaluees");
  if (job.review) return conflict("Cette mission possede deja un avis");

  const result = await parseJson(req, createReviewSchema);
  if ("response" in result) return result.response;
  const { rating, comment } = result.data;

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        jobId: job.id,
        clientId: user.client!.id,
        providerId: job.providerId,
        rating,
        comment,
      },
    });
    const stats = await tx.review.aggregate({
      where: { providerId: job.providerId, published: true },
      _avg: { rating: true },
    });
    await tx.provider.update({
      where: { id: job.providerId },
      data: { averageRating: stats._avg.rating ?? rating },
    });
    return created;
  });

  return NextResponse.json(review, { status: 201 });
}
