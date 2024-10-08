import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { hashPassword, genAccessToken, genRefreshToken } from "../util-auth.js";
import { handleLogin } from "./login.js";
import { accessSecretKey, db, refreshSecretKey } from "../global-store.js";

vi.mock("../util-auth", () => ({
  hashPassword: vi.fn(),
  genAccessToken: vi.fn(),
  genRefreshToken: vi.fn(),
}));

vi.mock("../global-store", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,

    db: {
      getUserByEmail: vi.fn(),
    },
    refreshSecretKey: vi.fn(),
    accessSecretKey: vi.fn(),
  };
});

const app = express();
app.use(express.json());

app.post("/login", handleLogin);

describe("Login Endpoint (mocked)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return 200 and token for valid credentials", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      pass: "hashedpassword",
    };

    db.getUserByEmail.mockResolvedValue(mockUser);
    hashPassword.mockReturnValue("hashedpassword");
    genAccessToken.mockResolvedValue("mocked-token");
    genRefreshToken.mockResolvedValue("mocked-token");

    const response = await request(app).post("/login").send({
      pass: "password123",
      email: "test@example.com",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      accessToken: "mocked-token",
      user: { id: mockUser.id, email: mockUser.email },
    });
    expect(db.getUserByEmail).toHaveBeenCalledWith("test@example.com");
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(genAccessToken).toHaveBeenCalledWith(
      {
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      },
      accessSecretKey
    );
    expect(genRefreshToken).toHaveBeenCalledWith(
      {
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      },
      refreshSecretKey
    );
  });

  test("should return 401 for invalid username", async () => {
    const mockUser = {
      user: "correctuser",
      pass: "hashedpassword",
    };

    db.getUserByEmail.mockResolvedValue(mockUser);
    hashPassword.mockReturnValue("hashedpassword");

    const response = await request(app).post("/login").send({
      user: "wronguser",
      pass: "password123",
      email: "test@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  test("should return 401 for invalid password", async () => {
    const mockUser = {
      user: "testuser",
      pass: "correcthashedpassword",
    };

    db.getUserByEmail.mockResolvedValue(mockUser);
    hashPassword.mockReturnValue("wronghashedpassword");

    const response = await request(app).post("/login").send({
      user: "testuser",
      pass: "wrongpassword",
      email: "test@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  test("should handle case when user is not found", async () => {
    db.getUserByEmail.mockResolvedValue(null);

    const response = await request(app).post("/login").send({
      user: "nonexistentuser",
      pass: "password123",
      email: "nonexistent@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });
});
