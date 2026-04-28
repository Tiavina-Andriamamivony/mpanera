import { describe, expect, it } from "vitest";
import { GET as listCategories } from "@/app/api/categories/route";
import { GET as getCategory } from "@/app/api/categories/[slug]/route";
import { prismaMock } from "./setup";
import { category } from "./fixtures";

describe("GET /categories", () => {
  it("returns categories", async () => {
    prismaMock.category.findMany.mockResolvedValue([category]);
    const res = await listCategories(new Request("http://test/api/categories"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  it("filters by parentId", async () => {
    prismaMock.category.findMany.mockResolvedValue([]);
    await listCategories(
      new Request(
        "http://test/api/categories?parentId=11111111-1111-4111-8111-111111111111",
      ),
    );
    expect(prismaMock.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { parentId: "11111111-1111-4111-8111-111111111111" },
      }),
    );
  });
});

describe("GET /categories/[slug]", () => {
  it("returns a category", async () => {
    prismaMock.category.findUnique.mockResolvedValue(category);
    const res = await getCategory(
      new Request("http://test/api/categories/plomberie"),
      { params: Promise.resolve({ slug: "plomberie" }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 when not found", async () => {
    prismaMock.category.findUnique.mockResolvedValue(null);
    const res = await getCategory(
      new Request("http://test/api/categories/missing"),
      { params: Promise.resolve({ slug: "missing" }) },
    );
    expect(res.status).toBe(404);
  });
});
