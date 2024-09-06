import { createDbConnection } from "./utils-db.js";

let dbInstance = null;

export function getDbInstance() {
  if (!dbInstance) {
    dbInstance = createDbConnection("./mydb.sqlite");
    console.log("holi", dbInstance);
  }
  return dbInstance;
}
