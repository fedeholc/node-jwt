import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { apiEP, apiURL, gitHubEP } from "../endpoints.js";
import { handleAuthGitHub, handleAuthGitHubCallback } from "./auth-github.js";
import process from "process";
import { configServer } from "../server.js";

import { it, afterEach } from "vitest";
import supertest from "supertest";
import * as endpointsModule from "../endpoints.js";
import * as utilAuthModule from "../util-auth.js";
import * as globalStoreModule from "../global-store.js";

const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;
const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&scope=user:email&redirect_uri=${redirectURI}`;

vi.mock("../endpoints.js");
vi.mock("../util-auth.js");
vi.mock("../global-store.js");
vi.mock("node:crypto");
vi.mock("node:process");

/* const app = configServer();
 */
const app = express();

/* app.use(express.json());
 */
app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);

describe("Auth Github EP no mock", () => {
  beforeEach(() => {
    //vi.clearAllMocks();
    vi.resetAllMocks();
    process.env.GITHUB_CLIENT_ID = "test-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-client-secret";
    endpointsModule.apiURL = {
      AUTH_GITHUB_CALLBACK: "http://localhost:3000/auth/github/callback",
    };
    endpointsModule.gitHubEP = {
      AUTHORIZE: "https://github.com/login/oauth/authorize",
      ACCESS_TOKEN: "https://github.com/login/oauth/access_token",
      USER: "https://api.github.com/user",
    };
    globalStoreModule.db = {
      getUserByEmail: vi.fn(),
      insertUser: vi.fn(),
    };
    globalStoreModule.refreshCookieOptions = { remember: {} };
    globalStoreModule.refreshSecretKey = "test-secret-key";
  });

  test("should return 200 and GH auth URL", async () => {
    const response = await request(app)
      .get(apiEP.AUTH_GITHUB + "?returnTo='return url'")
      .send();
    expect(response.status).toBe(200);
    expect(response.body.ghauth).toEqual(githubAuthURL);
  });

  test("should return 400 if no returnTo URL provided", async () => {
    const response = await request(app).get(apiEP.AUTH_GITHUB).send();
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "No returnTo URL provided" });
  });
});

describe("Auth Github Callback EP no mock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
});
