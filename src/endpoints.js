export { apiURL, apiBase, apiEP, ALLOWED_ORIGINS, gitHubEP };
import process from "process";

const apiBase = {
  DEV: `http://127.0.0.1:${process.env.PORT || 3000}`,
  PROD: "https://api.example.com",
};

let env;
if (process.env.NODE_ENV === "production") {
  env = "PROD";
} else {
  env = "DEV";
}

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
  BASE: apiBase[env],
  AUTH_GITHUB: apiBase[env] + apiEP.AUTH_GITHUB,
  AUTH_GITHUB_CALLBACK: apiBase[env] + apiEP.AUTH_GITHUB_CALLBACK,
  LOGIN: apiBase[env] + apiEP.LOGIN,
  LOGIN_2: apiBase[env] + apiEP.LOGIN_2,
  LOGOUT: apiBase[env] + apiEP.LOGOUT,
  PROFILE: apiBase[env] + apiEP.PROFILE,
  PROFILE_X: apiBase[env] + apiEP.PROFILE_X,
  REGISTER: apiBase[env] + apiEP.REGISTER,
  ROOT: apiBase[env] + apiEP.ROOT,
  USER_INFO: apiBase[env] + apiEP.USER_INFO,
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
