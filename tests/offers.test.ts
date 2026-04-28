import { describe, expect, it } from "vitest";
import {
  GET as listOffers,
  POST as createOffer,
} from "@/app/api/service-requests/[id]/offers/route";
import {
  GET as getOffer,
  PATCH as updateOffer,
} from "@/app/api/offers/[id]/route";
import { POST as acceptOffer } from "@/app/api/offers/[id]/accept/route";
import { POST as refuseOffer } from "@/app/api/offers/[id]/refuse/route";
import { POST as withdrawOffer } from "@/app/api/offers/[id]/withdraw/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  clientUser,
  job,
  notification,
  offer,
  providerUser,
  serviceRequest,
  jsonRequest,
} from "./fixtures";

describe("GET /service-requests/[id]/offers", () => {
  it("returns offers for the client", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.serviceRequest.findUnique.mockResolvedValue(serviceRequest);
    prismaMock.offer.findMany.mockResolvedValue([offer]);
    const res = await listOffers(
      new Request("http://test/api/service-requests/sr1/offers", {
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /service-requests/[id]/offers", () => {
  it("provider creates an offer", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.notification.findFirst.mockResolvedValue(notification);
    prismaMock.offer.findUnique.mockResolvedValue(null);
    prismaMock.offer.create.mockResolvedValue(offer);
    prismaMock.notification.update.mockResolvedValue(notification);
    prismaMock.serviceRequest.update.mockResolvedValue(serviceRequest);
    const res = await createOffer(
      jsonRequest("http://test/api/service-requests/sr1/offers", {
        method: "POST",
        body: {
          proposedPrice: 50000,
          message: "OK",
          slots: [{ start: "2026-04-21T08:00:00Z", end: "2026-04-21T10:00:00Z" }],
        },
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(201);
  });

  it("returns 403 if provider not notified", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.notification.findFirst.mockResolvedValue(null);
    const res = await createOffer(
      jsonRequest("http://test/api/service-requests/sr1/offers", {
        method: "POST",
        body: {
          proposedPrice: 50000,
          slots: [{ start: "2026-04-21T08:00:00Z", end: "2026-04-21T10:00:00Z" }],
        },
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: serviceRequest.id }) },
    );
    expect(res.status).toBe(403);
  });
});

describe("GET /offers/[id]", () => {
  it("returns the offer", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.offer.findUnique.mockResolvedValue(offer);
    const res = await getOffer(
      new Request("http://test/api/offers/o1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: offer.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 404 when missing", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.offer.findUnique.mockResolvedValue(null);
    const res = await getOffer(
      new Request("http://test/api/offers/o1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: "missing" }) },
    );
    expect(res.status).toBe(404);
  });
});

describe("PATCH /offers/[id]", () => {
  it("updates a pending offer (provider)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.offer.findUnique.mockResolvedValue(offer);
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") return cb(prismaMock);
      return cb;
    });
    prismaMock.offer.update.mockResolvedValue({ ...offer, message: "Updated" });
    const res = await updateOffer(
      jsonRequest("http://test/api/offers/o1", {
        method: "PATCH",
        body: { message: "Updated" },
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: offer.id }) },
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /offers/[id]/accept", () => {
  it("creates a job and marks request ASSIGNED", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.offer.findUnique.mockResolvedValue({
      ...offer,
      serviceRequest,
    } as never);
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") return cb(prismaMock);
      return cb;
    });
    prismaMock.job.create.mockResolvedValue(job);
    prismaMock.offer.update.mockResolvedValue({ ...offer, status: "ACCEPTED" });
    prismaMock.offer.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.serviceRequest.update.mockResolvedValue({ ...serviceRequest, status: "ASSIGNED" });
    const res = await acceptOffer(
      jsonRequest("http://test/api/offers/o1/accept", {
        method: "POST",
        body: {
          chosenSlotStart: "2026-04-21T08:00:00Z",
          chosenSlotEnd: "2026-04-21T10:00:00Z",
        },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: offer.id }) },
    );
    expect(res.status).toBe(201);
  });
});

describe("POST /offers/[id]/refuse", () => {
  it("refuses a pending offer", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.offer.findUnique.mockResolvedValue({
      ...offer,
      serviceRequest,
    } as never);
    prismaMock.offer.update.mockResolvedValue({ ...offer, status: "REFUSED" });
    const res = await refuseOffer(
      new Request("http://test/api/offers/o1/refuse", {
        method: "POST",
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: offer.id }) },
    );
    expect(res.status).toBe(200);
  });
});

describe("POST /offers/[id]/withdraw", () => {
  it("withdraws a pending offer (provider)", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.offer.findUnique.mockResolvedValue(offer);
    prismaMock.offer.update.mockResolvedValue({ ...offer, status: "WITHDRAWN" });
    const res = await withdrawOffer(
      new Request("http://test/api/offers/o1/withdraw", {
        method: "POST",
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: offer.id }) },
    );
    expect(res.status).toBe(200);
  });
});
