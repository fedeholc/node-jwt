import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { hashPassword, generateToken } from "../util-auth.js";
import { handleLogin2 } from "./handle-login2.js";
import { getUserByEmail } from "../utils-db.js";
import { getDbInstance } from "../db.js";
import { getSecretKey } from "../secret-key.js";

const secretKey = getSecretKey();
console.log("secretKey", secretKey);
const db = await getDbInstance();
//const db = await getDbInstance();
const app = express();
app.use(express.json());

app.post("/login", handleLogin2);

describe("Login Endpoint2 no mock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return 200 and token for valid credentials", async () => {
    const response = await request(app).post("/login").send({
      email: "z",
      pass: "z",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      token: "mocked-token",
      user: { id: 5, email: "z" },
    });
    expect(getUserByEmail).toHaveBeenCalledWith(db, "z");
    expect(hashPassword).toHaveBeenCalledWith("z");
    expect(generateToken).toHaveBeenCalledWith(
      {
        user: {
          id: 5,
          email: "z",
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

    getUserByEmail.mockResolvedValue(mockUser);
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

    getUserByEmail.mockResolvedValue(mockUser);
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
    getUserByEmail.mockResolvedValue(null);

    const response = await request(app).post("/login").send({
      user: "nonexistentuser",
      pass: "password123",
      email: "nonexistent@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });
});
