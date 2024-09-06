import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { hashPassword, generateToken } from "../util-auth";
import { handleLogin } from "./login-router";
import { getDbInstance } from "../db";
import { getUserByEmail } from "../utils-db";
//import { getSecretKey } from "../secret-key";

//VER ojo, hay que hacer un mock de getSecretKey porque se la llama automaticamente al importar el archivo login-router.js. Si no se hace el mock, el test falla porque se la llama y no devuelve la key, supongo que porque llama a process env sin el flag --env-file, de todos modos está bien no depender de que este el archivo. La cuestion es que para que no pase eso handleLogin que es lo que se quiere testear podría estar en otro archivo (otra cosa sería querer testear el router y no el handler, pero en este caso no tiene sentido porque el router no tiene lógica, solo llama al handler).
vi.mock("../secret-key.js", () => ({
  getSecretKey: vi.fn(),
}));
//VER con getDbInstance pasa lo mismo pero si no se hace el mock no falla, simplemente vuelve undefined, pero no sé por qué, si por el path a la base de datos o qué.
vi.mock("../db", () => ({
  getDbInstance: vi.fn(),
}));
//TODO: ver el tema del path a la base
vi.mock("../util-auth", () => ({
  hashPassword: vi.fn(),
  generateToken: vi.fn(),
}));
vi.mock("../utils-db", () => ({
  getUserByEmail: vi.fn(),
  createDbConnection: vi.fn(),
}));

const app = express();
app.use(express.json());

//getSecretKey.mockReturnValue("your-secret-key");
//const secretKey = getSecretKey();
const secretKey = "your-secret-key";
//getDbInstance.mockReturnValue({});
const db = getDbInstance();
app.post("/login", handleLogin(db, secretKey));

describe("Login Endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("should return 201 and token for valid credentials", async () => {
    const mockUser = {
      id: 1,
      user: "testuser",
      email: "test@example.com",
      pass: "hashedpassword",
    };

    getUserByEmail.mockResolvedValue(mockUser);
    hashPassword.mockReturnValue("hashedpassword");
    generateToken.mockResolvedValue("mocked-token");

    const response = await request(app).post("/login").send({
      user: "testuser",
      pass: "password123",
      email: "test@example.com",
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ token: "mocked-token" });
    expect(getUserByEmail).toHaveBeenCalledWith(db, "test@example.com");
    expect(hashPassword).toHaveBeenCalledWith("password123");
    expect(generateToken).toHaveBeenCalledWith(
      {
        id: mockUser.id,
        user: mockUser.user,
        email: mockUser.email,
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
