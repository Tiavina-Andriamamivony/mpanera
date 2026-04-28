import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/verification/documents/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  clientUser,
  providerUser,
  verificationDocument,
} from "./fixtures";

describe("GET /verification/documents", () => {
  it("returns provider's documents", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.verificationDocument.findMany.mockResolvedValue([verificationDocument]);
    const res = await GET(
      new Request("http://test/api/verification/documents", {
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
  });

  it("returns 403 if not a provider", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    const res = await GET(
      new Request("http://test/api/verification/documents", {
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(403);
  });
});

describe("POST /verification/documents", () => {
  it("uploads a document", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.verificationDocument.create.mockResolvedValue(verificationDocument);

    const fd = new FormData();
    fd.append("type", "ID_CARD_FRONT");
    fd.append("file", new File(["data"], "id.jpg", { type: "image/jpeg" }));
    const res = await POST(
      new Request("http://test/api/verification/documents", {
        method: "POST",
        body: fd,
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 422 for invalid type", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    const fd = new FormData();
    fd.append("type", "BAD_TYPE");
    fd.append("file", new File(["data"], "id.jpg", { type: "image/jpeg" }));
    const res = await POST(
      new Request("http://test/api/verification/documents", {
        method: "POST",
        body: fd,
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(422);
  });
});
