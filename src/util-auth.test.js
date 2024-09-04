// extractToken.test.js
import { describe, expect, test, vi, beforeEach } from "vitest";
import {extractToken} from "./util-auth";
import httpMocks from "node-mocks-http";
 
describe("extractToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = vi.fn(); // Simula la función `next()`
  });

  test("debería extraer el token correctamente cuando el encabezado de autorización es válido", () => {
    req.headers.authorization = "Bearer abc123token";

    extractToken(req, res, next);

    expect(req.token).toBe("abc123token");
    expect(next).toHaveBeenCalled();
  });

  test("debería retornar 401 si no hay encabezado de autorización", () => {
    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test('debería retornar 401 si el encabezado de autorización no empieza con "Bearer "', () => {
    req.headers.authorization = "Basic abc123token";

    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test('debería retornar 401 si el token está vacío después de "Bearer"', () => {
    req.headers.authorization = "Bearer ";

    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("debería llamar a next() si el token se extrae correctamente", () => {
    req.headers.authorization = "Bearer validToken";

    extractToken(req, res, next);

    expect(req.token).toBe("validToken");
    expect(next).toHaveBeenCalled();
  });
});
