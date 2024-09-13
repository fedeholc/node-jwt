import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

import { handleLogin} from "./handle-login.js";
/* import { getSecretKey } from "../secret-key.js";
import { getDbInstance } from "../db.js";

export const secretKey = getSecretKey();
export const db = await getDbInstance(); */

const app = express();
app.use(express.json());

app.post("/login", handleLogin);

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
    expect(response.body.user).toEqual({ id: 39, email: "z" });
  });

  test("should return 401 for invalid username", async () => {
    const response = await request(app).post("/login").send({
      user: "wronguser",
      pass: "password123",
      email: "test@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  test("should return 401 for invalid password", async () => {
    const response = await request(app).post("/login").send({
      user: "testuser",
      pass: "wrongpassword",
      email: "test@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });

  test("should handle case when user is not found", async () => {
    const response = await request(app).post("/login").send({
      user: "nonexistentuser",
      pass: "password123",
      email: "nonexistent@example.com",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Invalid credentials" });
  });
});
