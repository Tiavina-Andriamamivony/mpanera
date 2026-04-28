import { describe, expect, it } from "vitest";
import { GET as listJobs } from "@/app/api/jobs/route";
import { GET as getJob } from "@/app/api/jobs/[id]/route";
import { PATCH as updateJobStatus } from "@/app/api/jobs/[id]/status/route";
import { POST as initPayment } from "@/app/api/jobs/[id]/payment/route";
import { POST as createReview } from "@/app/api/jobs/[id]/review/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  clientUser,
  job,
  payment,
  providerUser,
  review,
  jsonRequest,
} from "./fixtures";

describe("GET /jobs", () => {
  it("lists client jobs", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findMany.mockResolvedValue([job]);
    prismaMock.job.count.mockResolvedValue(1);
    const res = await listJobs(
      new Request("http://test/api/jobs", { headers: bearer(clientUser.id) }),
    );
    expect(res.status).toBe(200);
  });
});

describe("GET /jobs/[id]", () => {
  it("returns a job for involved client", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findUnique.mockResolvedValue(job);
    const res = await getJob(
      new Request("http://test/api/jobs/j1", { headers: bearer(clientUser.id) }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 403 for unrelated user", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.job.findUnique.mockResolvedValue({ ...job, providerId: "other-provider" });
    const res = await getJob(
      new Request("http://test/api/jobs/j1", { headers: bearer(providerUser.id) }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(403);
  });
});

describe("PATCH /jobs/[id]/status", () => {
  it("transitions to IN_PROGRESS", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.job.findUnique.mockResolvedValue(job);
    prismaMock.job.update.mockResolvedValue({ ...job, status: "IN_PROGRESS" });
    const res = await updateJobStatus(
      jsonRequest("http://test/api/jobs/j1/status", {
        method: "PATCH",
        body: { status: "IN_PROGRESS" },
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("recomputes provider average on COMPLETED", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.job.findUnique.mockResolvedValue(job);
    prismaMock.job.update.mockResolvedValue({ ...job, status: "COMPLETED" });
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 4.8 } } as never);
    prismaMock.provider.update.mockResolvedValue({} as never);
    const res = await updateJobStatus(
      jsonRequest("http://test/api/jobs/j1/status", {
        method: "PATCH",
        body: { status: "COMPLETED" },
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(200);
    expect(prismaMock.provider.update).toHaveBeenCalled();
  });
});

describe("POST /jobs/[id]/payment", () => {
  it("initiates a MVOLA payment", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findUnique.mockResolvedValue({ ...job, payment: null } as never);
    prismaMock.payment.upsert.mockResolvedValue(payment);
    const res = await initPayment(
      jsonRequest("http://test/api/jobs/j1/payment", {
        method: "POST",
        body: { method: "MVOLA" },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.method).toBe("MVOLA");
    expect(body.instructions).toMatch(/mvola/i);
  });

  it("returns 409 if a non-failed payment exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findUnique.mockResolvedValue({
      ...job,
      payment: { ...payment, status: "PENDING" },
    } as never);
    const res = await initPayment(
      jsonRequest("http://test/api/jobs/j1/payment", {
        method: "POST",
        body: { method: "MVOLA" },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(409);
  });
});

describe("POST /jobs/[id]/review", () => {
  it("creates a review on a completed job", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findUnique.mockResolvedValue({
      ...job,
      status: "COMPLETED",
      review: null,
    } as never);
    prismaMock.$transaction.mockImplementation(async (cb: unknown) => {
      if (typeof cb === "function") return cb(prismaMock);
      return cb;
    });
    prismaMock.review.create.mockResolvedValue(review);
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 5 } } as never);
    prismaMock.provider.update.mockResolvedValue({} as never);

    const res = await createReview(
      jsonRequest("http://test/api/jobs/j1/review", {
        method: "POST",
        body: { rating: 5, comment: "Great" },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(201);
  });

  it("returns 409 when job is not COMPLETED", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    prismaMock.job.findUnique.mockResolvedValue({
      ...job,
      status: "IN_PROGRESS",
      review: null,
    } as never);
    const res = await createReview(
      jsonRequest("http://test/api/jobs/j1/review", {
        method: "POST",
        body: { rating: 5 },
        headers: bearer(clientUser.id),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(res.status).toBe(409);
  });
});
