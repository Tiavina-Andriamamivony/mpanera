import { describe, expect, it } from "vitest";
import { GET as searchProviders } from "@/app/api/providers/route";
import { GET as getProvider } from "@/app/api/providers/[id]/route";
import { GET as listProviderReviews } from "@/app/api/providers/[id]/reviews/route";
import { PUT as setMyCategories } from "@/app/api/providers/me/categories/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  category,
  clientUser,
  providerProfile,
  providerUser,
  review,
  jsonRequest,
} from "./fixtures";

describe("GET /providers", () => {
  it("returns paginated results", async () => {
    prismaMock.provider.findMany.mockResolvedValue([providerProfile]);
    prismaMock.provider.count.mockResolvedValue(1);
    const res = await searchProviders(new Request("http://test/api/providers?page=1&perPage=10"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
  });
});

describe("GET /providers/[id]", () => {
  it("returns the provider with categories and reviews", async () => {
    prismaMock.provider.findUnique.mockResolvedValue({
      ...providerProfile,
      categories: [{ category }],
      reviews: [review],
    } as never);
    const res = await getProvider(
      new Request("http://test/api/providers/p1"),
      { params: Promise.resolve({ id: providerProfile.id }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.categories[0].id).toBe(category.id);
  });

  it("returns 404 when missing", async () => {
    prismaMock.provider.findUnique.mockResolvedValue(null);
    const res = await getProvider(
      new Request("http://test/api/providers/missing"),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(res.status).toBe(404);
  });
});

describe("GET /providers/[id]/reviews", () => {
  it("returns paginated published reviews", async () => {
    prismaMock.review.findMany.mockResolvedValue([review]);
    prismaMock.review.count.mockResolvedValue(1);
    const res = await listProviderReviews(
      new Request("http://test/api/providers/p1/reviews?page=1&perPage=20"),
      { params: Promise.resolve({ id: providerProfile.id }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });
});

describe("PUT /providers/me/categories", () => {
  it("replaces categories", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.$transaction.mockResolvedValue([{ count: 0 }, { count: 1 }] as never);
    prismaMock.provider.findUnique.mockResolvedValue(providerProfile);
    const res = await setMyCategories(
      jsonRequest("http://test/api/providers/me/categories", {
        method: "PUT",
        body: { categoryIds: [category.id] },
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(200);
  });

  it("returns 403 if caller is not a provider", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    const res = await setMyCategories(
      jsonRequest("http://test/api/providers/me/categories", {
        method: "PUT",
        body: { categoryIds: [category.id] },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(403);
  });
});
