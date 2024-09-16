import { createDbConnection } from "./utils-db.js";
import { dbURI } from "./endpoints.js";

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
