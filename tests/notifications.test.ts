import { describe, expect, it } from "vitest";
import { GET as listNotifications } from "@/app/api/notifications/route";
import { PATCH as viewNotification } from "@/app/api/notifications/[id]/view/route";
import { prismaMock } from "./setup";
import {
  authedClient,
  authedProvider,
  bearer,
  clientUser,
  notification,
  providerUser,
} from "./fixtures";

describe("GET /notifications", () => {
  it("returns provider's notifications", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.notification.findMany.mockResolvedValue([notification]);
    prismaMock.notification.count.mockResolvedValue(1);
    const res = await listNotifications(
      new Request("http://test/api/notifications", { headers: bearer(providerUser.id) }),
    );
    expect(res.status).toBe(200);
  });

  it("returns 403 for clients", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedClient);
    const res = await listNotifications(
      new Request("http://test/api/notifications", { headers: bearer(clientUser.id) }),
    );
    expect(res.status).toBe(403);
  });
});

describe("PATCH /notifications/[id]/view", () => {
  it("marks a notification as viewed", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.notification.findUnique.mockResolvedValue(notification);
    prismaMock.notification.update.mockResolvedValue({
      ...notification,
      status: "VIEWED",
      viewedAt: new Date(),
    });
    const res = await viewNotification(
      new Request("http://test/api/notifications/n1/view", {
        method: "PATCH",
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: notification.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 403 if notification belongs to another provider", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.notification.findUnique.mockResolvedValue({
      ...notification,
      providerId: "other-provider",
    });
    const res = await viewNotification(
      new Request("http://test/api/notifications/n1/view", {
        method: "PATCH",
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: notification.id }) },
    );
    expect(res.status).toBe(403);
  });
});
