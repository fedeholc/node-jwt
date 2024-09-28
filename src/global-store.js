//TODO: no recuerdo la explicacion de por qué separé esto acá, creo que porque a la hora de hacer el testing habia un problema al importarse el db.js generaba db y secret keys vacias o algo asì pero de este modo no.
//VER si voy a escribir una explicación tendrìa que que probar si efectivamente es asì, y lo mismo ver con turso si es necesario.
import { getAccessSecretKey, getRefreshSecretKey } from "./secret-key.js";
import { dbSqlite3, dbTurso } from "./db-adapter.js";
import { dbURI } from "./endpoints.js";
import process from "process";

export const accessSecretKey = getAccessSecretKey();
export const refreshSecretKey = getRefreshSecretKey();
export const db = new dbSqlite3(dbURI);
/* export const db = new dbTurso(
  process.env.TURSO_DATABASE_URL,
  process.env.TURSO_AUTH_TOKEN
); */

export const accessJWTExpiration = {
  remember: "1h",
  noRemember: "10m",
};

export const refreshJWTExpiration = {
  remember: "30d",
  noRemember: "1h",
};

export const refreshCookieOptions = {
  remember: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, //30d
  },
  noRemember: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 60 * 60 * 1000, //1h,
  },
};
