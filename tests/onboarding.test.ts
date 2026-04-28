import { describe, expect, it } from "vitest";
import { POST as onboardClient } from "@/app/api/onboarding/client/route";
import { POST as onboardProvider } from "@/app/api/onboarding/provider/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  clientProfile,
  clientUser,
  providerProfile,
  providerUser,
  jsonRequest,
} from "./fixtures";

describe("POST /onboarding/client", () => {
  it("creates the client profile", async () => {
    const noClient = { ...authedClient, client: null };
    prismaMock.user.findUnique.mockResolvedValue(noClient);
    prismaMock.client.create.mockResolvedValue(clientProfile);
    prismaMock.user.update.mockResolvedValue({ ...clientUser, onboardingComplete: true });

    const res = await onboardClient(
      jsonRequest("http://test/api/onboarding/client", {
        method: "POST",
        body: { firstName: "Hery", lastName: "Rakoto" },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe(clientProfile.id);
  });

  it("returns 403 if user is not a CLIENT", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    const res = await onboardClient(
      jsonRequest("http://test/api/onboarding/client", {
        method: "POST",
        body: { firstName: "x", lastName: "y" },
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(403);
  });

  it("returns 409 if profile already exists", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    const res = await onboardClient(
      jsonRequest("http://test/api/onboarding/client", {
        method: "POST",
        body: { firstName: "x", lastName: "y" },
        headers: bearer(clientUser.id),
      }),
    );
    expect(res.status).toBe(409);
  });
});

describe("POST /onboarding/provider", () => {
  it("creates the provider profile", async () => {
    const noProvider = { ...authedProvider, provider: null };
    prismaMock.user.findUnique.mockResolvedValue(noProvider);
    prismaMock.provider.create.mockResolvedValue(providerProfile);
    prismaMock.user.update.mockResolvedValue({ ...providerUser, onboardingComplete: true });

    const res = await onboardProvider(
      jsonRequest("http://test/api/onboarding/provider", {
        method: "POST",
        body: {
          fullName: "Naina",
          categoryIds: ["55555555-5555-5555-5555-555555555555"],
        },
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(201);
  });

  it("returns 422 if categoryIds is empty", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...authedProvider, provider: null });
    const res = await onboardProvider(
      jsonRequest("http://test/api/onboarding/provider", {
        method: "POST",
        body: { fullName: "Naina", categoryIds: [] },
        headers: bearer(providerUser.id),
      }),
    );
    expect(res.status).toBe(422);
  });
});
