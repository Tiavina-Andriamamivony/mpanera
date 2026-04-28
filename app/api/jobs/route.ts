import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, parseQuery, unauthorized } from "@/lib/api-error";
import { jobListSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const result = parseQuery(new URL(req.url), jobListSchema);
  if ("response" in result) return result.response;
  const { page, perPage, status } = result.data;

  const where: import("@/lib/generated/prisma/client").Prisma.JobWhereInput = {};
  if (user.client) where.clientId = user.client.id;
  else if (user.provider) where.providerId = user.provider.id;
  else return forbidden("Onboarding non termine");
  if (status) where.status = status;

  const [data, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: "desc" },
    }),
    prisma.job.count({ where }),
  ]);
  return NextResponse.json({ data, page, perPage, total });
}
