//TODO: no recuerdo la explicacion de por qué separé esto acá, creo que porque a la hora de hacer el testing habia un problema al importarse el db.js generaba db y secret keys vacias o algo asì pero de este modo no.
//VER si voy a escribir una explicación tendrìa que que probar si efectivamente es asì, y lo mismo ver con turso si es necesario.
import { getSecretKey } from "./secret-key.js";
import { getDbInstance } from "./db.js";
import { turso } from "./db.js";
import { db as dbSqlite3 } from "./db-adapter.js";
export const secretKey = getSecretKey();
export const db = dbSqlite3;
export const dbTurso = turso;
