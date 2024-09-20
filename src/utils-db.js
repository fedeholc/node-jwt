/**
 * Utility functions to interact with the SQLite database
 */

export {
  insertUser,
  getUserByEmail,
  createDbConnection,
  deleteDbFile,
  deleteTable,
  closeDbConnection,
  deleteUser,
  updateUser,
};

import fs from "fs";
import sqlite3 from "sqlite3";

/**
 * Get a user by email
 * @param {Database} db - SQLite database object
 * @param {string} email - User email
 * @returns {Promise<{}> | Promise<Error>} - User object or error
 *
 */
async function getUserByEmail(db, email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM user WHERE email = ?", email, (error, row) => {
      if (error) {
        reject(error);
      }
      resolve(row);
    });
  });
}

/**
 * Insert a user into the database
 * @param {Database} db - SQLite database object
 * @param {string} email - User email
 * @param {string} pass - User password
 * @returns {Promise<number> | Promise<Error>} - User ID or error
 */
async function insertUser(db, email, pass) {
  return new Promise(function (resolve, reject) {
    db.run(
      "INSERT INTO user (email, pass) VALUES (?, ?)",
      [email, pass],
      function (error) {
        if (error) {
          reject(error);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

export async function insertUserTurso(db, email, pass) {
  return new Promise(function (resolve, reject) {
    try {
      const result = db.execute({
        sql: "INSERT INTO user (email, pass) VALUES (?,?)",
        args: [email, pass],
      });
      console.log("result: ", result);
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}
/* const result = await client.execute({
  sql: "SELECT * FROM users WHERE id = ?",
  args: [1],
});
 */
/**
 * Update the user password
 * @param {Database} db - SQLite database object
 * @param {string} email - User email
 * @param {string} pass - User password
 * @returns {Promise<boolean> | Promise<Error>} - True or error
 */
async function updateUser(db, email, pass) {
  return new Promise((resolve, reject) => {
    db.run(
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

/**
 * Delete a user from the database
 * @param {Database} db - SQLite database object
 * @param {string} email - User email
 * @returns {Promise<boolean> | Promise<Error>} - True or error
 */
async function deleteUser(db, email) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM user WHERE email = ?", email, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(true);
      }
    });
  });
}

/**
 * Close the connection with the database
 * @param {Database} db - SQLite database object
 * @returns {Promise<boolean> | Promise<Error>} - True or error
 */
function closeDbConnection(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
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
 * Create a connection with the database
 * @param {string} filepath
 * @returns {Promise<Database> | Promise<Error>} - SQLite database object or
 * Error
 */
async function createDbConnection(filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      console.log("Database exists");
      let db = new sqlite3.Database(filepath, (error) => {
        if (error) {
          console.error("Error creating database:", error.message);
          reject(error);
        } else {
          console.log("Connection with SQLite has been established");
          resolve(db);
        }
      });
    } else {
      console.log("Creating database");
      let db = new sqlite3.Database(filepath, (error) => {
        if (error) {
          console.error("Error creating database:", error.message);
          reject(error);
        } else {
          console.log("Connection with SQLite has been established");
          resolve(db);
        }
      });
    }
  });
}

/**
 * Delete the database file
 * @param {string} filepath
 * @returns {Promise<boolean> | Promise<Error>} - True or error
 */
async function deleteDbFile(filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (error) => {
        if (error) {
          console.error(error.message);
          reject(error);
        } else {
          console.log("Database file deleted");
          resolve(true);
        }
      });
    } else {
      console.error("File does not exist");
      reject(new Error("File does not exist"));
    }
  });
}

/**
 * Delete a table from the database
 * @param {string} tableName
 * @param {Database} db
 * @returns
 */
async function deleteTable(tableName, db) {
  return new Promise((resolve, reject) => {
    db.exec(`DROP TABLE IF EXISTS ${tableName}`, (error) => {
      if (error) {
        console.error(error.message);
        reject(error);
      } else {
        console.log("Table deleted.");
        resolve(true);
      }
    });
  });
}
