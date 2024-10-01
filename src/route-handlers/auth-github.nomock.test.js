import { expect, test, describe, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { apiEP, apiURL, gitHubEP } from "../endpoints.js";
import { handleAuthGitHub, handleAuthGitHubCallback } from "./auth-github.js";
import process from "process";
import { configServer } from "../server.js";

const clientID = process.env.GITHUB_CLIENT_ID;
//const clientSecret = process.env.GITHUB_CLIENT_SECRET;

const redirectURI = apiURL.AUTH_GITHUB_CALLBACK;
const githubAuthURL = `${gitHubEP.AUTHORIZE}?client_id=${clientID}&scope=user:email&redirect_uri=${redirectURI}`;

const app = configServer();

app.use(express.json());

app.get(apiEP.AUTH_GITHUB, handleAuthGitHub);
app.get(apiEP.AUTH_GITHUB_CALLBACK, handleAuthGitHubCallback);

describe("Auth Github EP no mock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

  test("should return 500 if no authorization code received", async () => {
    const response = await request(app).get(apiEP.AUTH_GITHUB_CALLBACK).send();
    expect(response.status).toBe(500);
    expect(response.text).toEqual("No authorization code received");
  });

  test("should return 500 if no access token received from GitHub", async () => {
    const response = await request(app)
      .get(apiEP.AUTH_GITHUB_CALLBACK + "?code=123")
      .send();
    expect(response.status).toBe(500);
    expect(response.text).toEqual("No access token received from GitHub");
  });

  /*  test("should return 200 if access token received from GitHub", async () => {
    const response = await request(app)
      .get(apiEP.AUTH_GITHUB_CALLBACK + "?code=123")
      .send();
    expect(response.status).toBe(200);
    expect(response.text).toEqual("No access token received from GitHub");
  }); */
});
