export { dbURI, apiURL, apiBase, apiEP, ALLOWED_ORIGINS, gitHubEP };
import process from "process";

const ENV = process.env.NODE_ENV || "development";

console.log("ENV", process.env.NODE_ENV);

const dbURIs = {
  production: process.env.DB_PROD_URI || "mydb.sqlite",
  development: process.env.DB_DEV_URI || "mydb.sqlite",
  test: process.env.DB_TEST_URI || "mydb.sqlite",
};
const dbURI = dbURIs[ENV];

const apiBase = {
  development: `http://127.0.0.1:${process.env.PORT || 3000}`,
  test: `http://127.0.0.1:${process.env.PORT || 3000}`,
  production: "https://api.example.com",
};

const apiEP = {
  AUTH_GITHUB: "/auth/github",
  AUTH_GITHUB_CALLBACK: "/auth/github/callback",
  LOGIN: "/login",
  LOGIN_2: "/login2",
  LOGOUT: "/logout",
  PROFILE: "/profile",
  PROFILE_X: "/profileX",
  REGISTER: "/register",
  ROOT: "/",
  USER_INFO: "/user-info",
};

const apiURL = {
  BASE: apiBase[ENV],
  AUTH_GITHUB: apiBase[ENV] + apiEP.AUTH_GITHUB,
  AUTH_GITHUB_CALLBACK: apiBase[ENV] + apiEP.AUTH_GITHUB_CALLBACK,
  LOGIN: apiBase[ENV] + apiEP.LOGIN,
  LOGIN_2: apiBase[ENV] + apiEP.LOGIN_2,
  LOGOUT: apiBase[ENV] + apiEP.LOGOUT,
  PROFILE: apiBase[ENV] + apiEP.PROFILE,
  PROFILE_X: apiBase[ENV] + apiEP.PROFILE_X,
  REGISTER: apiBase[ENV] + apiEP.REGISTER,
  ROOT: apiBase[ENV] + apiEP.ROOT,
  USER_INFO: apiBase[ENV] + apiEP.USER_INFO,
};

const ALLOWED_ORIGINS = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:8080",
  "http://localhost:8080",
];

const gitHubEP = {
  AUTHORIZE: "https://github.com/login/oauth/authorize",
  ACCESS_TOKEN: "https://github.com/login/oauth/access_token",
  USER: "https://api.github.com/user",
};