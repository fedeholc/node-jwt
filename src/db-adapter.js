import sqlite3 from "sqlite3";
import { dbURI } from "./endpoints.js";

class DBInterface {
  constructor() {
    if (new.target === DBInterface) {
      throw new TypeError("Cannot construct DBInterface instances directly");
    }
  }

  createDbConnection(dbURI) {
    throw new Error("El método 'createDbConnection()' debe ser implementado");
  }

  getData(query, params) {
    throw new Error("El método 'obtenerDatos()' debe ser implementado");
  }

  writeData(query, params) {
    throw new Error("El método 'escribirDatos()' debe ser implementado");
  }
  updateUser(email, pass) {
    throw new Error("El método 'updateUser()' debe ser implementado");
  }
  deleteUser(email) {
    throw new Error("El método 'deleteUser()' debe ser implementado");
  }
  closeDbConnection() {
    throw new Error("El método 'closeDbConnection()' debe ser implementado");
  }
  insertUser(email, pass) {
    throw new Error("El método 'insertUser()' debe ser implementado");
  }
  getUserByEmail(email) {
    throw new Error("El método 'getUserByEmail()' debe ser implementado");
  }
}

export class dbSqlite3 extends DBInterface {
  constructor(dbURI) {
    super();
    this.dbURI = dbURI;
    this.init();
  }

  async init() {
    this.db = await this.getDbInstance(this.dbURI);
    console.log("DBx", this.db, this.dbURI);
  }

  getDbInstance(dbURI) {
    return new Promise((resolve, reject) => {
      console.log("DB URI", dbURI);
      this.createDbConnection(dbURI)
        .then((instance) => {
          this.db = instance;
          resolve(this.db);
        })
        .catch(reject);
    });
  }
  getDbInstance2(dbURI) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        console.log("DB URI", dbURI);
        this.createDbConnection(dbURI)
          .then((instance) => {
            this.db = instance;
            resolve(this.db);
          })
          .catch(reject);
      } else {
        resolve(this.db);
      }
    });
  }
  async deleteUser(email) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM user WHERE email = ?", email, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }
  async updateUser(email, pass) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE user SET pass = ? WHERE email = ?",
        [pass, email],
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async getUserByEmailX(email) {
    console.log("this db", this.db);
    const dbInstance = await this.getDbInstance(this.dbURI);
    return new Promise((resolve, reject) => {
      dbInstance.get(
        "SELECT * FROM user WHERE email = ?",
        email,
        (error, row) => {
          if (error) {
            reject(error);
          }
          resolve(row);
        }
      );
    });
  }

  async getUserByEmail(email) {
    console.log("this db", this.db);
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM user WHERE email = ?", email, (error, row) => {
        if (error) {
          console.log("Error getting user by email", error);
          reject(error);
        }
        console.log("Row", row);
        resolve(row);
      });
    });
  }
  async createDbConnection(filepath) {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(filepath, (error) => {
        if (error) {
          console.error("Error creating database:", error.message);
          reject(error);
        } else {
          console.log("Connection with SQLite has been established");
          resolve(this.db);
        }
      });
    });
  }

  closeDbConnection() {
    return new Promise((resolve, reject) => {
      this.db.close((error) => {
        if (error) {
          console.error("Error closing the database:", error.message);
          reject(error);
        } else {
          console.log("Database connection closed");
          resolve(true);
        }
      });
    });
  }

  // por no tener la funcion del promise como arrow fallaba el list.lastID ya que apuntaba a otro scope, o sea al de la propia callback y no al this de la base de datos!
  async insertUser(email, pass) {
    console.log("this db en insert user", this.db);
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO user (email, pass) VALUES (?, ?)",
        [email, pass],
        function (error) {
          if (error) {
            console.log("Error inserting user", error);
            reject(error);
          } else {
            console.log("this lastID", this.lastID);
            resolve(this.lastID);
          }
        }
      );
    });
  }
}

/* export const db = new dbSqlite3(dbURI);
console.log("db en db-adapter.js", db); */
