import { describe, expect, it } from "vitest";
import { GET, PATCH } from "@/app/api/me/route";
import { prismaMock } from "./setup";
import { authedClient, bearer, clientUser, jsonRequest } from "./fixtures";

describe("GET /me", () => {
  it("returns 401 when not authenticated", async () => {
    const res = await GET(new Request("http://test/api/me"));
    expect(res.status).toBe(401);
  });

  it("returns the current user with profile", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    const res = await GET(new Request("http://test/api/me", { headers: bearer(clientUser.id) }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(clientUser.id);
    expect(body.client.id).toBe(authedClient.client!.id);
  });
});

describe("PATCH /me", () => {
  it("updates the email", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(authedClient)
      .mockResolvedValueOnce(null);
    prismaMock.user.update.mockResolvedValue({ ...clientUser, email: "new@test.mg" });
    const res = await PATCH(
      jsonRequest("http://test/api/me", {
        method: "PATCH",
        body: { email: "new@test.mg" },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.email).toBe("new@test.mg");
  });

  it("returns 409 if email already taken", async () => {
    prismaMock.user.findUnique
      .mockResolvedValueOnce(authedClient)
      .mockResolvedValueOnce({ ...clientUser, id: "other" });
    const res = await PATCH(
      jsonRequest("http://test/api/me", {
        method: "PATCH",
        body: { email: "taken@test.mg" },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(409);
  });
});
