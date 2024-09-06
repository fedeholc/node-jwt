import { createDbConnection } from "./utils-db.js";
import path from "path";
import { rootPath } from "./root-path.js";

let dbInstance = null;

export function getDbInstance() {
  return new Promise((resolve, reject) => {
    if (!dbInstance) {
      const dbPath = path.join(rootPath, "mydb.sqlite");
      createDbConnection(dbPath)
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
