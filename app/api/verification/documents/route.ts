import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { badRequest, forbidden, unauthorized, zodErrorResponse } from "@/lib/api-error";
import { verificationDocTypeSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const user = await getAuthUser(req);
  if (!user || !user.provider) return unauthorized();

  const docs = await prisma.verificationDocument.findMany({
    where: { providerId: user.provider.id },
    orderBy: { submittedAt: "desc" },
  });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  if (!user.provider) return forbidden("L'appelant n'est pas un prestataire");

  const form = await req.formData();
  const typeRaw = form.get("type");
  const file = form.get("file");
  if (typeof typeRaw !== "string") return badRequest("Type manquant");
  if (!(file instanceof File)) return badRequest("Fichier manquant");

  const parsed = verificationDocTypeSchema.safeParse(typeRaw);
  if (!parsed.success) return zodErrorResponse(parsed.error);

  // TODO: upload to object storage. For now, persist a placeholder URL.
  const fileUrl = `/uploads/verification/${user.provider.id}/${randomUUID()}-${file.name}`;

  const doc = await prisma.verificationDocument.create({
    data: {
      providerId: user.provider.id,
      type: parsed.data,
      fileUrl,
    },
  });
  return NextResponse.json(doc, { status: 201 });
}
