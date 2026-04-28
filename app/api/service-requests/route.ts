import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, parseJson, parseQuery, unauthorized } from "@/lib/api-error";
import { createServiceRequestSchema, serviceRequestListSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const result = parseQuery(new URL(req.url), serviceRequestListSchema);
  if ("response" in result) return result.response;
  const { page, perPage, status, categoryId } = result.data;

  const where: import("@/lib/generated/prisma/client").Prisma.ServiceRequestWhereInput = {};
  if (user.role === "CLIENT" && user.client) {
    where.clientId = user.client.id;
  } else if (user.role === "PROVIDER" && user.provider) {
    where.notifications = { some: { providerId: user.provider.id } };
  } else {
    return forbidden("Onboarding non termine");
  }
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;

  const [data, total] = await Promise.all([
    prisma.serviceRequest.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.serviceRequest.count({ where }),
  ]);
  return NextResponse.json({ data, page, perPage, total });
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.client) return forbidden("Seuls les clients peuvent creer des demandes de service");
  const clientId = user.client.id;

  const result = await parseJson(req, createServiceRequestSchema);
  if ("response" in result) return result.response;

  const providers = await prisma.provider.findMany({
    where: {
      verified: true,
      user: { active: true },
      categories: { some: { categoryId: result.data.categoryId } },
      ...(result.data.district ? { district: result.data.district } : {}),
    },
    select: { id: true },
  });

  const created = await prisma.$transaction(async (tx) => {
    const serviceRequest = await tx.serviceRequest.create({
      data: { ...result.data, clientId, status: "OPEN" },
    });

    if (providers.length > 0) {
      await tx.notification.createMany({
        data: providers.map((provider) => ({
          serviceRequestId: serviceRequest.id,
          providerId: provider.id,
        })),
      });
    }

    return serviceRequest;
  });

  return NextResponse.json(created, { status: 201 });
}
