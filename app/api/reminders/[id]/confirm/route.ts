import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { conflict, forbidden, notFound, unauthorized } from "@/lib/api-error";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("Only providers can confirm reminders");
  const { id } = await params;

  const reminder = await prisma.updateReminder.findUnique({ where: { id } });
  if (!reminder) return notFound("Reminder");
  if (reminder.providerId !== user.provider.id) return forbidden("Not your reminder");
  if (reminder.status !== "SENT") return conflict("Reminder is not pending");

  const now = new Date();
  const next = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30); // 30 days

  const [updated] = await prisma.$transaction([
    prisma.updateReminder.update({
      where: { id },
      data: { status: "CONFIRMED", confirmedAt: now },
    }),
    prisma.provider.update({
      where: { id: user.provider.id },
      data: { contactUpdatedAt: now, nextContactReminderAt: next },
    }),
  ]);
  return NextResponse.json(updated);
}
