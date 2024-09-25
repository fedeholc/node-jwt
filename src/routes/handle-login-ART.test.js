import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import {
  hashPassword,
  generateToken,
  genAccessToken,
  genRefreshToken,
} from "../util-auth.js";
import { handleLoginART } from "./handle-login-ART.js";
import { db, secretKey } from "../global-store.js";

vi.mock("../util-auth", () => ({
  hashPassword: vi.fn(),
  generateToken: vi.fn(),
  genAccessToken: vi.fn(),
  genRefreshToken: vi.fn(),
}));

vi.mock("../global-store", () => ({
  db: {
    getUserByEmail: vi.fn(),
  },
  secretKey: vi.fn(),
}));

const app = express();
app.use(express.json());

app.post("/login", handleLoginART);

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
      secretKey
    );
    expect(genRefreshToken).toHaveBeenCalledWith(
      {
        user: {
          id: mockUser.id,
          email: mockUser.email,
        },
      },
      secretKey
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
