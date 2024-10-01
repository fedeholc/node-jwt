import { apiURL } from "./endpoints-front";
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
