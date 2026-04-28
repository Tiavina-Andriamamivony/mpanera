import { describe, expect, it } from "vitest";
import { GET as getPayment } from "@/app/api/payments/[id]/route";
import { POST as webhook } from "@/app/api/payments/webhook/route";
import { prismaMock } from "./setup";
import { authedClient, bearer, clientUser, job, payment, jsonRequest } from "./fixtures";

describe("GET /payments/[id]", () => {
  it("returns the payment for the owning client", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.payment.findUnique.mockResolvedValue({ ...payment, job } as never);
    const res = await getPayment(
      new Request("http://test/api/payments/p1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: payment.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 403 for unrelated users", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.payment.findUnique.mockResolvedValue({
      ...payment,
      clientId: "other-client",
      job: { ...job, providerId: "other-provider" },
    } as never);
    const res = await getPayment(
      new Request("http://test/api/payments/p1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: payment.id }) },
    );
    expect(res.status).toBe(403);
  });
});

describe("POST /payments/webhook", () => {
  it("marks payment SUCCESS and job PAID", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(payment);
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") return cb(prismaMock);
      return cb;
    });
    prismaMock.payment.update.mockResolvedValue({ ...payment, status: "SUCCESS" });
    prismaMock.job.update.mockResolvedValue({ ...job, status: "PAID" });
    const res = await webhook(
      jsonRequest("http://test/api/payments/webhook", {
        method: "POST",
        body: { apiReference: payment.apiReference, status: "success" },
      }),
    );
    expect(res.status).toBe(200);
    expect(prismaMock.job.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "PAID" } }),
    );
  });

  it("ignores unknown references", async () => {
    prismaMock.payment.findUnique.mockResolvedValue(null);
    const res = await webhook(
      jsonRequest("http://test/api/payments/webhook", {
        method: "POST",
        body: { apiReference: "unknown", status: "success" },
      }),
    );
    expect(res.status).toBe(200);
  });
});
