/**
 *
 * @param {string} token - Access token
 * @returns {boolean} - True if token is expired
 */
export function isTokenExpired(token) {
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
