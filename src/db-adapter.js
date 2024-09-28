/* eslint-disable no-unused-vars */
import sqlite3 from "sqlite3";
import { createClient } from "@libsql/client";

class DBInterface {
  constructor() {
    if (new.target === DBInterface) {
      throw new TypeError("Cannot construct DBInterface instances directly");
    }
  }

  /**
   * @param {string} token
   * @param {number} expiration
   */
  addToDenyList(token, expiration) {
    throw new Error("The method 'addToDenyList()' must be implemented");
  }

  closeDbConnection() {
    throw new Error("The method 'closeDbConnection()' must be implemented");
  }

  createTables() {
    throw new Error("The method 'createTables()' must be implemented");
  }

  /**
   * @param {string} email
   */
  deleteUser(email) {
    throw new Error("The method 'deleteUser()' must be implemented");
  }

  /**
   * @param {string} email
   */
  getUserByEmail(email) {
    throw new Error("The method 'getUserByEmail()' must be implemented");
  }

  /**
   * @param {string} email
   * @param {string} pass
   */
  insertUser(email, pass) {
    throw new Error("The method 'insertUser()' must be implemented");
  }

  /**
   * @param {string} token
   */
  isDeniedToken(token) {
    throw new Error("The method 'isDeniedToken()' must be implemented");
  }

  /**
   * @param {string} email
   * @param {string} pass
   */
  updateUser(email, pass) {
    throw new Error("The method 'updateUser()' must be implemented");
  }
}

/**
 * @extends {DBInterface}
 */
export class dbSqlite3 extends DBInterface {
  /**
   * @param {string} dbURI
   */
  constructor(dbURI) {
    super();

    /** @type {string} */
    this.dbURI = dbURI;

    /** @type {sqlite3.Database} */
    this.db = null;

    this.#init();
  }

  /**
   * Get the database instance
   * @param {string} dbURI - Database URI
   * @returns {sqlite3.Database | null} - Database instance
   */
  #getDbInstance(dbURI) {
    if (this.db) {
      return this.db; // Retorna la instancia existente si ya está creada
    }
    try {
      let instance = new sqlite3.Database(dbURI);
      return instance;
    } catch (error) {
      console.error("Error creating database", error);
      throw error;
    }
  }

  #init() {
    this.db = this.#getDbInstance(this.dbURI);
  }

  /**
   * Add a token to the denylist
   * @param {string} token - Token to add
   * @param {number} expiration - Token expiration
   * @returns {Promise<boolean>} - True if the token was added, false otherwise
   */
  async addToDenyList(token, expiration) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO denylist (token, expiration) VALUES (?, ?)",
        [token, expiration],
        (error) => {
          if (error) {
            console.error("Error adding token to blacklist", error);
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
  }
  /**
   * Close the connection with the database
   * @returns {Promise<boolean | null>} - True or error
   */
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

  /**
   * Create the tables in the database
   * @returns {Promise<boolean>} - True if the tables were created, false otherwise
   */
  async createTables() {
    console.log("this.db", this.db);
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(
          `CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            pass TEXT NOT NULL
          )`,
          (error) => {
            if (error) {
              console.error("Error creating 'user' table:", error.message);
              reject(error); // Rechaza la promesa si hay un error
              return; // Detiene la ejecución
            } else {
              console.log("'user' table created");
            }
          }
        );

        this.db.run(
          `CREATE TABLE IF NOT EXISTS denylist (
            token TEXT PRIMARY KEY,
            expiration INTEGER
          )`,
          (error) => {
            if (error) {
              console.error("Error creating 'denylist' table:", error.message);
              reject(error); // Rechaza la promesa si hay un error
            } else {
              console.log("'denylist' table created");
              resolve(true); // Resuelve la promesa cuando ambas tablas hayan sido creadas
            }
          }
        );
      });
    });
  }

  /**
   * Delete a user from the database
   * @param {string} email - User email
   * @returns {Promise<boolean | null>} - True or error
   */
  async deleteUser(email) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM user WHERE email = ?", email, (error) => {
        if (error) {
          console.error("Error deleting user", error);
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Get a user by email
   * @param {string} email - User email
   * @returns {Promise<User | null>} - User object or null if not found
   */
  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM user WHERE email = ?", email, (error, row) => {
        if (error) {
          console.error("Error getting user by email: ", error);
          reject(error);
        }
        resolve(row);
      });
    });
  }

  // por no tener la funcion del promise como arrow fallaba el list.lastID ya que apuntaba a otro scope, o sea al de la propia callback y no al this de la base de datos!
  /**
   * Insert a user into the database
   * @param {string} email - User email
   * @param {string} pass - User password
   * @returns {Promise<number | null>} - User ID or error
   */
  async insertUser(email, pass) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO user (email, pass) VALUES (?, ?)",
        [email, pass],
        function (error) {
          if (error) {
            console.error("Error inserting user", error);
            reject(error);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Check if a token is in the denylist
   * @param {string} token - Token to check
   * @returns {Promise<boolean>} - True if the token is in the denylist, false otherwise
   */
  async isDeniedToken(token) {
    return new Promise((resolve, reject) => {
      this.db.get(
        "SELECT token FROM denylist WHERE token = ?",
        [token],
        (error, row) => {
          if (error) {
            console.error("Error getting denied token", error);
            reject(error);
          }
          if (row) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }

  /**
   * Update the user password
   * @param {string} email - User email
   * @param {string} pass - User password
   * @returns {Promise<boolean | null > } - True or error
   */
  async updateUser(email, pass) {
    return new Promise((resolve, reject) => {
      this.db.run(
        "UPDATE user SET pass = ? WHERE email = ?",
        [pass, email],
        (error) => {
          if (error) {
            console.error("Error updating user", error);
            reject(error);
          } else {
            resolve(true);
          }
        }
      );
    });
  }
}

/**
 * @extends {DBInterface}
 */
export class dbTurso extends DBInterface {
  /**
   * @param {string} dbURI
   * @param {string} authToken
   */
  constructor(dbURI, authToken) {
    super();
    this.db = null;
    this.dbURI = dbURI;
    this.authToken = authToken;
    this.#init();
  }

  /**
   * Initialize the database
   */
  #init() {
    this.db = this.#getDbInstance(this.dbURI, this.authToken);
    console.log("DBx turso", this.db, this.dbURI);
  }

  /**
   * Get the database instance
   * @param {string} dbURI - Database URI
   * @param {string} authToken - Auth token
   * @returns {import('@libsql/client').Client} - Database instance
   */
  #getDbInstance(dbURI, authToken) {
    if (this.db) {
      return this.db; // Retorna la instancia existente si ya está creada
    }
    let tursoDb = createClient({ url: dbURI, authToken: authToken });
    return tursoDb;
  }

  /**
   * Insert a user into the database
   * @param {string} email - User email
   * @param {string} pass - User password
   * @returns {Promise<number>} - User ID
   */
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

  /**
   * @typedef {object} User
   * @property {number} id
   * @property {string} email
   * @property {string} pass
   */

  /**
   * Get a user by email
   * @param {string} email - User email
   * @returns {Promise<User| null>} - User object or null if not found
   */
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

      let user = /** @type {User} user */ (
        /** @type {unknown} */ (result.rows[0])
      );
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * Delete a user from the database
   * @param {string} email - User email
   * @returns {Promise<boolean>} - True if the user was deleted
   */
  async deleteUser(email) {
    try {
      const result = await this.db.execute({
        sql: "DELETE FROM user WHERE email = ?",
        args: [email],
      });

      return result.rowsAffected > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * @param {string} email
   * @param {string} pass
   * @returns {Promise<boolean>} - True if the user was updated
   */
  async updateUser(email, pass) {
    try {
      const result = await this.db.execute({
        sql: "UPDATE user SET pass = ? WHERE email = ?",
        args: [pass, email],
      });
      return result.rowsAffected > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  closeDbConnection() {
    try {
      this.db.close();
      console.log("Database connection closed");
      return true;
    } catch (error) {
      console.error("Error closing the database:", error.message);
      return error;
    }
  }

  async createTables() {
    try {
      console.log("this.db turso", this.db);
      this.db.execute({
        sql: `CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            pass TEXT NOT NULL
          )`,
        args: [],
      });

      this.db.execute({
        sql: `CREATE TABLE IF NOT EXISTS denylist (
            token TEXT PRIMARY KEY,
            expiration INTEGER
          )`,
        args: [],
      });
    } catch (error) {
      console.error("Error creating tables", error);
      throw error;
    }
  }
}
