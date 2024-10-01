import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { getNewAccessToken, getAccessToken } from "./auth.js";
import { isTokenExpired } from "./istoken";

vi.mock("./istoken.js", async (importOriginal) => {
  /**@type {Object} */
  const actual = await importOriginal();
  return {
    ...actual, // Spread the original import
    isTokenExpired: vi.fn(() => {
      console.log("Mock isTokenExpired called");
      return false;
    }),
  };
});
vi.mock("./auth.js", async (importOriginal) => {
  /**@type {Object} */
  const actual = await importOriginal();
  return {
    ...actual, // Spread the original import
    getAccessToken: actual.getAccessToken,
    isTokenExpired: vi.fn(() => {
      console.log("Mock isTokenExpired called");
      return false;
    }),
    getNewAccessToken: vi.fn(() => {
      console.log("Mock getNewAccessToken called");
      return null;
    }),
  };
});
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

describe("getAccessToken", () => {
  it("should return access token if it exists and is not expired", async () => {
    const mockToken = "mockToken";
    localStorage.setItem("accessToken", JSON.stringify(mockToken));
    console.log(
      "at en local:",
      JSON.parse(localStorage.getItem("accessToken"))
    );
    isTokenExpired.mockReturnValue(false); // Token is not expired
    getNewAccessToken.mockResolvedValue(null); // No new token received
    const result = await getAccessToken();
    expect(result).toBe(mockToken);
    expect(isTokenExpired).toHaveBeenCalledWith(mockToken);
  });
});
