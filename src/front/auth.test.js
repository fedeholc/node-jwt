import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
/* import { getNewAccessToken, isTokenExpired2, getAccessToken } from "./auth.js";
 */ import { auth, getAccessToken } from "./auth.js";
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

describe.skip("getNewAccessToken", () => {
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

    const result = await getNewAccessToken();
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

    const result = await getNewAccessToken();
    expect(result).toBeNull(); // Verify that the result is null
  });

  it("should return null when fetch throws an error", async () => {
    // Mock fetch to simulate an error
    globalThis.fetch = vi.fn(() => Promise.reject(new Error("Fetch failed")));

    const result = await getNewAccessToken();
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

    await getNewAccessToken();

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

describe.skip("isTokenExpired", () => {
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
    expect(isTokenExpired(null)).toBe(true);
  });

  it("should return true for an undefined token", () => {
    expect(isTokenExpired(undefined)).toBe(true);
  });

  it("should return true for an empty string token", () => {
    expect(isTokenExpired("")).toBe(true);
  });

  it("should return true for an expired token", () => {
    const expiredToken = generateToken(Math.floor(Date.now() / 1000) - 3600); // Token expired 1 hour ago
    expect(isTokenExpired(expiredToken)).toBe(true);
  });

  it("should return false for a valid token", () => {
    const validToken = generateToken(Math.floor(Date.now() / 1000) + 3600); // Token expires 1 hour from now
    expect(isTokenExpired(validToken)).toBe(false);
  });

  it("should return true for a malformed token", () => {
    const malformedToken = "not.a.valid.token";
    expect(isTokenExpired(malformedToken)).toBe(true);
  });

  it("should log an error for a malformed token", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const malformedToken = "not.a.valid.token";
    isTokenExpired(malformedToken);
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error decoding token: ",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

describe("getAccessToken", () => {
  vi.mock("./auth.js", async (importOriginal) => {
    /**@type {Object} */
    const actual = await importOriginal();
    return {
      auth: {
        isTokenExpired: vi.fn(),
        getNewAccessToken: vi.fn(),
        getAccessToken: actual.getAccessToken,
      },
    };
  });

  it("should return access token if it exists and is not expired", async () => {
    const mockToken = "mockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    console.log(
      "at en local:",
      JSON.parse(localStorage.getItem("accessToken"))
    );
    // @ts-ignore
    auth.isTokenExpired.mockReturnValue(false); // Token is not expired
    // @ts-ignore
    auth.getNewAccessToken.mockResolvedValue(mockToken); // No new token received
    console.log("---gatoken", auth.getAccessToken);
    const result = await auth.getAccessToken();
    expect(result).toBe(mockToken);
    expect(auth.isTokenExpired).toHaveBeenCalledWith(mockToken);
  });

  it("should return new access token if the existing token is expired", async () => {
    const mockToken = "mockToken";
    const newToken = "newMockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    auth.isTokenExpired.mockReturnValue(true); // Token is expired
    auth.getNewAccessToken.mockResolvedValue(newToken); // Return a new token

    const result = await auth.getAccessToken();
    expect(result).toBe(newToken);
    expect(localStorage.getItem("accessToken")).toBe(JSON.stringify(newToken));
    expect(auth.isTokenExpired).toHaveBeenCalledWith(mockToken);
    expect(auth.getNewAccessToken).toHaveBeenCalled();
  });

  it("should return null if no new access token is received", async () => {
    const mockToken = "mockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    console.log("--auth:", auth);
    auth.isTokenExpired.mockReturnValue(true); // Token is expired
    auth.getNewAccessToken.mockResolvedValue(null); // No new token received
    const result = await auth.getAccessToken();
    expect(result).toBeNull();
    expect(localStorage.getItem("accessToken")).toBe(JSON.stringify(mockToken)); // Old token is still there
    expect(auth.getNewAccessToken).toHaveBeenCalled();
  });

  it.skip("should return null if localStorage has no access token", async () => {
    mockGetNewAccessToken.mockResolvedValue(null); // No new token received

    const result = await getAccessToken();
    expect(result).toBeNull();
    expect(mockGetNewAccessToken).toHaveBeenCalled();
  });

  it.skip("should handle errors gracefully and return null", async () => {
    // Simulate an error in localStorage or JSON parsing
    localStorage.setItem("accessToken", "{invalidJson");
    const result = await getAccessToken();
    expect(result).toBeNull();
  });
});
