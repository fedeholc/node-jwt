export { apiURL, apiEP, ENV as env, apiBase };
const apiPort = 1234;
const apiBase = {
  development: `http://127.0.0.1:${apiPort}`,
  production: "https://api.example.com",
};

let ENV;
if (window.location.hostname === "127.0.0.1") {
  ENV = "development";
} else {
  ENV = "production";
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
