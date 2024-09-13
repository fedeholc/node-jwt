import { createDbConnection } from "./utils-db.js";

import { dbURI } from "./endpoints.js";
let dbInstance = null;

//TODO: convendría crear la BD (con algunos datos) en caso de que no exista??
export function getDbInstance() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      //const dbPath = path.join(rootPath, "mydb.sqlite");
      console.log("DB URI", dbURI);
      createDbConnection(dbURI)
        .then((instance) => {
          dbInstance = instance;
          resolve(dbInstance);
        })
        .catch((error) => {
          reject(error);
        });
    } else {
      resolve(dbInstance);
    }
  });
}
