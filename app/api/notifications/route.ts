import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, parseQuery, unauthorized } from "@/lib/api-error";
import { notificationListSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("L'appelant n'est pas un prestataire");

  const result = parseQuery(new URL(req.url), notificationListSchema);
  if ("response" in result) return result.response;
  const { page, perPage, status } = result.data;

  const where = {
    providerId: user.provider.id,
    ...(status && { status }),
  };
  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { serviceRequest: true },
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { sentAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);
  return NextResponse.json({ data, page, perPage, total });
}
