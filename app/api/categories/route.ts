import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuery } from "@/lib/api-error";
import { categoryListSchema } from "@/lib/validation";

export async function GET(req: Request) {
  const result = parseQuery(new URL(req.url), categoryListSchema);
  if ("response" in result) return result.response;
  const { parentId, rootOnly } = result.data;

  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: "asc" }, { name: "asc" }],
  });

  type CategoryNode = (typeof categories)[number] & { children: CategoryNode[] };
  const byId = new Map<string, CategoryNode>();

  for (const category of categories) {
    byId.set(category.id, { ...category, children: [] });
  }

  const roots: CategoryNode[] = [];
  for (const category of byId.values()) {
    if (category.parentId) {
      const parent = byId.get(category.parentId);
      if (parent) {
        parent.children.push(category);
        continue;
      }
    }
    roots.push(category);
  }

  if (parentId) {
    const parent = byId.get(parentId);
    return NextResponse.json(parent?.children ?? []);
  }

  if (rootOnly) {
    return NextResponse.json(roots);
  }

  return NextResponse.json(roots);
}
