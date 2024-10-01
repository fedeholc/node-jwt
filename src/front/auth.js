import { apiURL } from "./endpoints-front.js";

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
export function isTokenExpired(token) {
  console.log("holi: ", token);
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
export async function getAccessToken() {
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
export async function getNewAccessToken() {
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
