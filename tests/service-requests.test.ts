import { describe, expect, it } from "vitest";
import { GET as listSr, POST as createSr } from "@/app/api/service-requests/route";
import {
  GET as getSr,
  PATCH as updateSr,
  DELETE as closeSr,
} from "@/app/api/service-requests/[id]/route";
import { POST as addPhoto } from "@/app/api/service-requests/[id]/photos/route";
import { DELETE as removePhoto } from "@/app/api/service-requests/[id]/photos/[photoId]/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  category,
  clientProfile,
  clientUser,
  providerUser,
  serviceRequest,
  serviceRequestPhoto,
  jsonRequest,
} from "./fixtures";

describe("GET /service-requests", () => {
  it("returns the client's requests", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findMany.mockResolvedValue([serviceRequest]);
    prismaMock.serviceRequest.count.mockResolvedValue(1);
    const res = await listSr(
      new Request("http://test/api/service-requests", { headers: bearer(clientUser.id) }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveLength(1);
  });

  it("scopes to providers via notifications", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.serviceRequest.findMany.mockResolvedValue([]);
    prismaMock.serviceRequest.count.mockResolvedValue(0);
    await listSr(
      new Request("http://test/api/service-requests", { headers: bearer(providerUser.id) }),
    );
    expect(prismaMock.serviceRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ notifications: { some: expect.any(Object) } }),
      }),
    );
  });
});

describe("POST /service-requests", () => {
  it("creates a request as a client", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.create.mockResolvedValue(serviceRequest);
    const res = await createSr(
      jsonRequest("http://test/api/service-requests", {
        method: "POST",
        body: {
          categoryId: category.id,
          title: "Fuite",
          description: "Description",
        },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 403 if caller is not a client", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    const res = await createSr(
      jsonRequest("http://test/api/service-requests", {
        method: "POST",
        body: { categoryId: category.id, title: "x", description: "y" },
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(403);
  });
});

describe("GET /service-requests/[id]", () => {
  it("returns the request with relations", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue({
      ...serviceRequest,
      client: clientProfile,
      category,
      photos: [],
      offers: [],
    } as never);
    const res = await getSr(
      new Request("http://test/api/service-requests/sr1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(200);
  });
});

describe("PATCH /service-requests/[id]", () => {
  it("updates an OPEN request", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue(serviceRequest);
    prismaMock.serviceRequest.update.mockResolvedValue({
      ...serviceRequest,
      title: "Updated title",
    });
    const res = await updateSr(
      jsonRequest("http://test/api/service-requests/sr1", {
        method: "PATCH",
        body: { title: "Updated title" },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 409 if request is not OPEN", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue({
      ...serviceRequest,
      status: "ASSIGNED",
    });
    const res = await updateSr(
      jsonRequest("http://test/api/service-requests/sr1", {
        method: "PATCH",
        body: { title: "x" },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(409);
  });
});

describe("DELETE /service-requests/[id]", () => {
  it("closes the request", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue(serviceRequest);
    prismaMock.serviceRequest.update.mockResolvedValue({ ...serviceRequest, status: "CLOSED" });
    const res = await closeSr(
      new Request("http://test/api/service-requests/sr1", {
        method: "DELETE",
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(204);
  });
});

describe("POST /service-requests/[id]/photos", () => {
  it("uploads a photo", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue(serviceRequest);
    prismaMock.serviceRequestPhoto.create.mockResolvedValue(serviceRequestPhoto);

    const fd = new FormData();
    fd.append("file", new File(["fake"], "photo.jpg", { type: "image/jpeg" }));
    fd.append("order", "0");
    const req = new Request("http://test/api/service-requests/sr1/photos", {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${bearer(clientUser.id).Authorization.split(" ")[1]}` },
    });
    const res = await addPhoto(req, { params: Promise.resolve({ id: serviceRequest.id }) });
    expect(res.status).toBe(201);
  });
});

describe("DELETE /service-requests/[id]/photos/[photoId]", () => {
  it("removes a photo", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequestPhoto.findUnique.mockResolvedValue({
      ...serviceRequestPhoto,
      serviceRequest,
    } as never);
    prismaMock.serviceRequestPhoto.delete.mockResolvedValue(serviceRequestPhoto);
    const res = await removePhoto(
      new Request("http://test/api/service-requests/sr1/photos/p1", {
        method: "DELETE",
        headers: bearer(clientUser.id),
      }),
      {
        params: Promise.resolve({
          id: serviceRequest.id,
          photoId: serviceRequestPhoto.id,
        }),
      },
    );
    expect(res.status).toBe(204);
  });
});
