import { describe, expect, it } from "vitest";
import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as refresh } from "@/app/api/auth/refresh/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { signRefreshToken } from "@/lib/auth";
import { prismaMock } from "./setup";
import { clientUser, jsonRequest } from "./fixtures";

describe("POST /auth/register", () => {
  it("creates a user and returns tokens", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(clientUser);

    const res = await register(
      jsonRequest("http://test/api/auth/register", {
        method: "POST",
        body: {
          email: "new@test.mg",
          phone: "+261341234567",
          password: "secret123",
          role: "CLIENT",
        },
      }),
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      user: { id: clientUser.id },
    });
  });

  it("returns 409 if email or phone is taken", async () => {
    prismaMock.user.findFirst.mockResolvedValue(clientUser);
    const res = await register(
      jsonRequest("http://test/api/auth/register", {
        method: "POST",
        body: {
          email: clientUser.email,
          phone: "+261340000099",
          password: "secret123",
          role: "CLIENT",
        },
      }),
    );
    expect(res.status).toBe(409);
  });

  it("returns 422 for invalid body", async () => {
    const res = await register(
      jsonRequest("http://test/api/auth/register", {
        method: "POST",
        body: { email: "bad", password: "x", role: "CLIENT" },
      }),
    );
    expect(res.status).toBe(422);
  });
});

describe("POST /auth/login", () => {
  it("returns tokens on valid credentials", async () => {
    prismaMock.user.findFirst.mockResolvedValue(clientUser);
    prismaMock.user.update.mockResolvedValue(clientUser);

    const res = await login(
      jsonRequest("http://test/api/auth/login", {
        method: "POST",
        body: { email: clientUser.email, password: "secret123" },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toEqual(expect.any(String));
  });

  it("returns 401 if password mismatches", async () => {
    prismaMock.user.findFirst.mockResolvedValue(clientUser);
    const res = await login(
      jsonRequest("http://test/api/auth/login", {
        method: "POST",
        body: { email: clientUser.email, password: "wrong-password" },
      }),
    );
    expect(res.status).toBe(401);
  });

  it("returns 401 if user does not exist", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const res = await login(
      jsonRequest("http://test/api/auth/login", {
        method: "POST",
        body: { email: "missing@test.mg", password: "secret123" },
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/refresh", () => {
  it("issues new tokens with a valid refresh token", async () => {
    prismaMock.user.findUnique.mockResolvedValue(clientUser);
    const refreshToken = signRefreshToken(clientUser.id);
    const res = await refresh(
      jsonRequest("http://test/api/auth/refresh", { method: "POST", body: { refreshToken } }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toEqual(expect.any(String));
  });

  it("returns 401 with an invalid refresh token", async () => {
    const res = await refresh(
      jsonRequest("http://test/api/auth/refresh", {
        method: "POST",
        body: { refreshToken: "garbage" },
      }),
    );
    expect(res.status).toBe(401);
  });
});

describe("POST /auth/logout", () => {
  it("returns 204", async () => {
    const res = await logout();
    expect(res.status).toBe(204);
  });
});
