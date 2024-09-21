import sqlite3 from "sqlite3";
import { createClient } from "@libsql/client";

class DBInterface {
  constructor() {
    //
    if (new.target === DBInterface) {
      throw new TypeError("Cannot construct DBInterface instances directly");
    }
  }

  createDbConnection(dbURI) {
    throw new Error("The method 'createDbConnection()' must be implemented");
  }

  getData(query, params) {
    throw new Error("The method 'getData()' must be implemented");
  }

  writeData(query, params) {
    throw new Error("The method 'writeData()' must be implemented");
  }
  updateUser() {
    throw new Error("The method 'updateUser()' must be implemented");
  }
  deleteUser(email) {
    throw new Error("The method 'deleteUser()' must be implemented");
  }
  closeDbConnection() {
    throw new Error("The method 'closeDbConnection()' must be implemented");
  }
  insertUser(email, pass) {
    throw new Error("The method 'insertUser()' must be implemented");
  }
  getUserByEmail(email) {
    throw new Error("The method 'getUserByEmail()' must be implemented");
  }
}

export class dbSqlite3 extends DBInterface {
  constructor(dbURI) {
    super();
    this.db = null;
    this.dbURI = dbURI;
    this.#init();
  }

  async #init() {
    this.db = await this.#getDbInstance(this.dbURI);
    console.log("DBx", this.db, this.dbURI);
  }

  async #getDbInstance(dbURI) {
    if (this.db) {
      return this.db; // Retorna la instancia existente si ya está creada
    }
    return new Promise((resolve, reject) => {
      console.log("DB URI", dbURI);
      let instance = new sqlite3.Database(dbURI, (error) => {
        if (error) {
          console.error("Error creating database:", error.message);
          reject(error);
        } else {
          console.log("Connection with SQLite has been established");
          resolve(instance);
        }
      });
    });
  }

  async closeDbConnection() {
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

export class dbTurso extends DBInterface {
  constructor(dbURI, authToken) {
    super();
    this.db = null;
    this.dbURI = dbURI;
    this.authToken = authToken;
    this.#init();
  }

  async #init() {
    this.db = await this.#getDbInstance(this.dbURI, this.authToken);
    console.log("DBx turso", this.db, this.dbURI);
  }

  async #getDbInstance(dbURI, authToken) {
    if (this.db) {
      return this.db; // Retorna la instancia existente si ya está creada
    }
    let tursoDb = createClient({ url: dbURI, authToken: authToken });
    return tursoDb;
  }

  async insertUser(email, pass) {
    try {
      const result = await this.db.execute({
        sql: "INSERT INTO user (email, pass) VALUES (?,?)",
        args: [email, pass],
      });
      console.log("typeof result: ", typeof result.lastInsertRowid);
      return Number(result.lastInsertRowid);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async getUserByEmail(email) {
    try {
      const result = await this.db.execute({
        sql: "SELECT * FROM user WHERE email = ?",
        args: [email],
      });
      console.log("result", result);
      if (!result.rows.length) {
        return null;
      }
      return result.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async deleteUser(email) {
    try {
      const result = await this.db.execute({
        sql: "DELETE FROM user WHERE email = ?",
        args: [email],
      });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async updateUser(email, pass) {
    try {
      const result = await this.db.execute({
        sql: "UPDATE user SET pass = ? WHERE email = ?",
        args: [pass, email],
      });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async closeDbConnection() {
    this.db.close((error) => {
      if (error) {
        console.error("Error closing the database:", error.message);
        return error;
      } else {
        console.log("Database connection closed");
        return true;
      }
    });
  }
}
