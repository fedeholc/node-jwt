import { apiURL } from "./endpoints-front.js";
// eslint-disable-next-line no-unused-vars
import * as types from "./types.js";

//- - - - - - - - - - - - - - - - - - - - - - - -
//- Funciones: autenticación. - - - - - - - - - -
//- - - - - - - - - - - - - - - - - - - - - - - -

export const auth = {
  getAccessToken: getAccessToken,
  getNewAccessToken: getNewAccessToken,
  isTokenExpired: isTokenExpired,
};
/**
 *
 * @param {string} token - Access token
 * @returns {boolean} - True if token is expired
 */
function isTokenExpired(token) {
  try {
    if (!token) return true;
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token: ", error);
    return true;
  }
}

/**
 * @returns {Promise<string | null>} - User data or null
 */
async function getAccessToken() {
  try {
    let accessToken = JSON.parse(localStorage.getItem("accessToken"));

    console.log(
      "at en authjs:",
      JSON.parse(localStorage.getItem("accessToken"))
    );
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return accessToken;
    }

    let newAccessToken = await this.getNewAccessToken();
    if (newAccessToken) {
      localStorage.setItem("accessToken", JSON.stringify(newAccessToken));
      return newAccessToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting access token: ${error}`);
    return null;
  }
}

/**
 * @returns {Promise<string | null>} - Access token or null
 */
async function getNewAccessToken() {
  try {
    const response = await fetch(apiURL.REFRESH, {
      method: "POST",
      credentials: "include", // Esto asegura que la cookie HTTP-only se envíe con la solicitud
    });
    const data = await response.json();
    if (data.accessToken) {
      return data.accessToken;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching new access token: ${error}`);
    return null;
  }
}

/**
 * @param {string} accessToken
 * @returns {Promise<types.UserPayload | null>} - User data or null
 */
export async function getUserData(accessToken) {
  try {
    if (!accessToken) {
      console.log("No token found.");
      return null;
    }

    let response = await fetch(apiURL.GET_USER, {
      method: "GET",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("--response: ", response);
    if (!response.ok) {
      console.log(
        `No user authenticated: ${response.status} ${response.statusText}`
      );
      return null;
    }

    if (response.ok) {
      let data = await response.json();

      /** @type {types.UserPayload} */
      let user = data.user;
      if (!user) {
        console.log(`No user data. ${response.status} ${response.statusText}`);
        return null;
      }

      return user;
    }
  } catch (error) {
    console.error(`Error loading user data: ${error}`);
    return null;
  }
}
