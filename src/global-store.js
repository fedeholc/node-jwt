import { getSecretKey } from "./secret-key.js";
import { getDbInstance } from "./db.js";
import { turso } from "./db.js";
export const secretKey = getSecretKey();
export const db = await getDbInstance();
export const dbTurso = turso;
