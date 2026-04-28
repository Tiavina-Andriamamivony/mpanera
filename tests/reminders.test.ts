import { describe, expect, it } from "vitest";
import { POST as confirmReminder } from "@/app/api/reminders/[id]/confirm/route";
import { prismaMock } from "./setup";
import { authedProvider, bearer, providerUser, updateReminder } from "./fixtures";

describe("POST /reminders/[id]/confirm", () => {
  it("confirms a sent reminder", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.updateReminder.findUnique.mockResolvedValue(updateReminder);
    prismaMock.$transaction.mockResolvedValue([
      { ...updateReminder, status: "CONFIRMED", confirmedAt: new Date() },
      authedProvider.provider!,
    ]);
    const res = await confirmReminder(
      new Request("http://test/api/reminders/r1/confirm", {
        method: "POST",
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: updateReminder.id }) },
    );
    expect(res.status).toBe(200);
  });

  it("returns 409 if already confirmed", async () => {
    prismaMock.user.findUnique.mockResolvedValue(authedProvider);
    prismaMock.updateReminder.findUnique.mockResolvedValue({
      ...updateReminder,
      status: "CONFIRMED",
    });
    const res = await confirmReminder(
      new Request("http://test/api/reminders/r1/confirm", {
        method: "POST",
        headers: bearer(providerUser.id),
      }),
      { params: Promise.resolve({ id: updateReminder.id }) },
    );
    expect(res.status).toBe(409);
  });
});
