import { createDbConnection } from "./utils-db.js";
import { dbURI } from "./endpoints.js";
import process from "process";

import { createClient } from "@libsql/client";

export const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let dbInstance = null;

//TODO: convendría crear la BD (con algunos datos) en caso de que no exista??
export function getDbInstance() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      console.log("DB URI", dbURI);
      createDbConnection(dbURI)
        .then((instance) => {
          dbInstance = instance;
          resolve(dbInstance);
        })
        .catch(reject);
    } else {
      resolve(dbInstance);
    }
  });
}
