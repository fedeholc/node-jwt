import { createDbConnection } from "./utils-db.js";
import path from "path";
import { rootPath } from "./root-path.js";
import { dbURI } from "./endpoints.js";
let dbInstance = null;

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
