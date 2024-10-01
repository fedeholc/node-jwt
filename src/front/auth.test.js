import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { auth } from "./auth.js";
// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value;
    },
    clear() {
      store = {};
    },
  };
})();

// Assign localStorageMock to global.localStorage
// @ts-ignore
globalThis.localStorage = localStorageMock;

/// Clean up mocks after each test
afterEach(() => {
  vi.clearAllMocks(); // Clear all fetch mocks after each test
});

beforeEach(() => {
  // Clear mocks and localStorage before each test
  vi.clearAllMocks();
  localStorage.clear();
});

describe("getNewAccessToken", () => {
  it("should return the access token when the response is successful and contains accessToken", async () => {
    const mockAccessToken = "mockToken123";

    // Mock fetch to return a successful response
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ accessToken: mockAccessToken }),
      })
    );

    // @ts-ignore
    const result = await auth.getNewAccessToken();
    expect(result).toBe(mockAccessToken); // Verify that the access token is as expected
  });

  it("should return null when the response does not contain accessToken", async () => {
    // Mock fetch to return a successful response without token
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      })
    );

    // @ts-ignore
    const result = await auth.getNewAccessToken();
    expect(result).toBeNull(); // Verify that the result is null
  });

  it("should return null when fetch throws an error", async () => {
    // Mock fetch to simulate an error
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Fetch failed")));

    const result = await auth.getNewAccessToken();
    expect(result).toBeNull(); // Verify that the result is null
  });

  it("should make fetch with 'credentials: include'", async () => {
    const mockAccessToken = "mockToken123";

    // Mock fetch to return a successful response
    // @ts-ignore
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ accessToken: mockAccessToken }),
      })
    );

    await auth.getNewAccessToken();

    // Verify that fetch was called with credentials: 'include'
    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: "POST",
        credentials: "include", // We verify that 'credentials' is set to 'include'
      })
    );
  });
});

describe("isTokenExpired", () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    vi.resetModules();
  });
  // Helper function to generate a test token
  /**
   * @param {number} expirationTime
   */
  function generateToken(expirationTime) {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({ exp: expirationTime }));
    const signature = "fake-signature"; // In a real scenario, this would be a proper signature
    return `${header}.${payload}.${signature}`;
  }

  it("should return true for a null token", () => {
    expect(auth.isTokenExpired(null)).toBe(true);
  });

  it("should return true for an undefined token", () => {
    expect(auth.isTokenExpired(undefined)).toBe(true);
  });

  it("should return true for an empty string token", () => {
    expect(auth.isTokenExpired("")).toBe(true);
  });

  it("should return true for an expired token", () => {
    const expiredToken = generateToken(Math.floor(Date.now() / 1000) - 3600); // Token expired 1 hour ago
    expect(auth.isTokenExpired(expiredToken)).toBe(true);
  });

  it("should return false for a valid token", () => {
    const validToken = generateToken(Math.floor(Date.now() / 1000) + 3600); // Token expires 1 hour from now
    expect(auth.isTokenExpired(validToken)).toBe(false);
  });

  it("should return true for a malformed token", () => {
    const malformedToken = "not.a.valid.token";
    expect(auth.isTokenExpired(malformedToken)).toBe(true);
  });

  it("should log an error for a malformed token", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const malformedToken = "not.a.valid.token";
    auth.isTokenExpired(malformedToken);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error decoding token: ",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

describe("getAccessToken", () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    vi.resetModules();
  });

  it("should return access token if it exists and is not expired", async () => {
    const mockToken = "mockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    vi.spyOn(auth, "isTokenExpired").mockReturnValue(true);
    vi.spyOn(auth, "getNewAccessToken").mockResolvedValue(mockToken);
    const result = await auth.getAccessToken();
    expect(result).toBe(mockToken);
    expect(auth.isTokenExpired).toHaveBeenCalledWith(mockToken);
  });

  it("should return new access token if the existing token is expired", async () => {
    const mockToken = "mockToken";
    const newToken = "newMockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    vi.spyOn(auth, "isTokenExpired").mockReturnValue(true);
    vi.spyOn(auth, "getNewAccessToken").mockResolvedValue(newToken);
    const result = await auth.getAccessToken();
    expect(result).toBe(newToken);
    expect(localStorage.getItem("accessToken")).toBe(JSON.stringify(newToken));
    expect(auth.isTokenExpired).toHaveBeenCalledWith(mockToken);
    expect(auth.getNewAccessToken).toHaveBeenCalled();
  });

  it("should return null if no new access token is received", async () => {
    const mockToken = "mockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    vi.spyOn(auth, "isTokenExpired").mockImplementation(() => true);
    vi.spyOn(auth, "getNewAccessToken").mockResolvedValue(null);
    const result = await auth.getAccessToken();
    expect(result).toBeNull();
    expect(localStorage.getItem("accessToken")).toBe(JSON.stringify(mockToken));
    expect(auth.getNewAccessToken).toHaveBeenCalled();
  });

  it("should return null if localStorage has no access token", async () => {
    vi.spyOn(auth, "getNewAccessToken").mockResolvedValue(null);
    const result = await auth.getAccessToken();
    expect(result).toBeNull();

    expect(auth.getNewAccessToken).toHaveBeenCalled();
  });

  it("should handle errors gracefully and return null", async () => {
    localStorage.setItem("accessToken", "{invalidJson");
    const result = await auth.getAccessToken();
    expect(result).toBeNull();
  });
});
