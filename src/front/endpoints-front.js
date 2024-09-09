export { apiURL, apiEP, env, apiBase };
const PORT = 1234;
const apiBase = {
  DEV: `http://127.0.0.1:${PORT}`,
  PROD: "https://api.example.com",
};

let env;
if (window.location.hostname === "127.0.0.1") {
  env = "DEV";
} else {
  env = "PROD";
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
