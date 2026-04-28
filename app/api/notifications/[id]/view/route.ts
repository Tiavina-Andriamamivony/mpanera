import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("Only providers can view notifications");
  const { id } = await params;

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) return notFound("Notification");
  if (notification.providerId !== user.provider.id) return forbidden("Cette notification ne vous appartient pas");

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      status: notification.status === "SENT" ? "VIEWED" : notification.status,
      viewedAt: notification.viewedAt ?? new Date(),
    },
  });
  return NextResponse.json(updated);
}
