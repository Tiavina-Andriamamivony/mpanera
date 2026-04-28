import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";

export function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>,
) {
  const body = fields
    ? { error: { code, message, fields } }
    : { error: { code, message } };
  return NextResponse.json(body, { status });
}

export const unauthorized = () => errorResponse(401, "UNAUTHORIZED", "Jeton manquant ou invalide");
export const forbidden = (message = "Action non autorisee") => errorResponse(403, "FORBIDDEN", message);
export const notFound = (resource = "Ressource") =>
  errorResponse(404, "NOT_FOUND", `${resource} introuvable`);
export const conflict = (message: string) => errorResponse(409, "CONFLICT", message);
export const badRequest = (message: string) => errorResponse(400, "BAD_REQUEST", message);

export function zodErrorResponse(err: ZodError) {
  const fields: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_root";
    (fields[key] ??= []).push(issue.message);
  }
  return errorResponse(422, "VALIDATION_ERROR", "La validation a echoue", fields);
}

export async function parseJson<T>(
  req: Request,
  schema: ZodType<T>,
): Promise<{ data: T } | { response: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { response: badRequest("JSON invalide") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { response: zodErrorResponse(parsed.error) };
  return { data: parsed.data };
}

export function parseQuery<T>(url: URL, schema: ZodType<T>):
  | { data: T }
  | { response: NextResponse } {
  const obj: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    obj[k] = v;
  });
  const parsed = schema.safeParse(obj);
  if (!parsed.success) return { response: zodErrorResponse(parsed.error) };
  return { data: parsed.data };
}
