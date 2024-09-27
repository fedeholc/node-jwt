// extractToken.test.js
import { describe, expect, test, vi, beforeEach } from "vitest";
import { extractToken } from "./middleware.js";
import httpMocks from "node-mocks-http";

describe("extractToken middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = vi.fn(); // Simula la función `next()`
  });

  test("should extract token from valid Authorization header", () => {
    /* 
    En lugar de usar el httpMocks de arriba, podría crear yo el req que necesito:
     const req = {
      headers: {
        authorization: 'Bearer validtoken123'
      }
    };
    const res = {};
    next = vi.fn(); 
    */

    req.headers.authorization = "Bearer abc123token";

    extractToken(req, res, next);

    expect(req.token).toBe("abc123token");
    expect(next).toHaveBeenCalled();
  });

  test("should return 401 for missing Authorization header", () => {
    // req está vacío
    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 for Authorization header without Bearer", () => {
    req.headers.authorization = "NotBearer abc123token";

    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should return 401 for empty token after Bearer", () => {
    req.headers.authorization = "Bearer ";

    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should trim token correctly", () => {
    req.headers.authorization = "Bearer   token123    ";

    extractToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res._getJSONData()).toEqual({ error: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  test("should call next() if token is ok", () => {
    req.headers.authorization = "Bearer validToken";

    extractToken(req, res, next);

    expect(req.token).toBe("validToken");
    expect(next).toHaveBeenCalled();
  });
});
