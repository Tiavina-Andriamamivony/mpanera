import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, parseJson, unauthorized } from "@/lib/api-error";
import { createPaymentSchema } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Only clients can initiate payments");
  const { id } = await params;

  const job = await prisma.job.findUnique({ where: { id }, include: { payment: true } });
  if (!job) return notFound("Mission");
  if (job.clientId !== user.client.id) return forbidden("Cette mission ne vous appartient pas");
  if (job.payment && job.payment.status !== "FAILED") {
    return conflict("Cette mission possede deja un paiement actif");
  }

  const result = await parseJson(req, createPaymentSchema);
  if ("response" in result) return result.response;
  const { method } = result.data;

  // TODO: integrate with mvola/orange/airtel/stripe APIs.
  const apiReference = `${method.toLowerCase()}-${randomUUID()}`;
  const payment = await prisma.payment.upsert({
    where: { jobId: job.id },
    update: { method, status: "PENDING", apiReference, rawPayload: null, paidAt: null },
    create: {
      jobId: job.id,
      clientId: user.client.id,
      amount: job.finalPrice,
      method,
      apiReference,
    },
  });

  const instructions =
    method === "CARD"
      ? null
      : `Confirmez le paiement dans votre application ${method.toLowerCase().replace("_", " ")} avec la reference ${apiReference}.`;
  const redirectUrl = method === "CARD" ? `/checkout/${payment.id}` : null;

  return NextResponse.json({ ...payment, instructions, redirectUrl }, { status: 201 });
}
