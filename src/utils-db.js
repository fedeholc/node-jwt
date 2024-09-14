export {
  insertUser,
  getUserByEmail,
  createDbConnection,
  deleteDbFile,
  deleteTable,
  closeDbConnection,
  deleteUser,
};

import fs from "fs";
import sqlite3 from "sqlite3";

/**
 * @param {Database} db - SQLite database object
 * @param {string} email - User email
 *
 */

async function getUserByEmail(db, email) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM user WHERE email = ?", email, (err, row) => {
      if (err) {
        reject(err);
      }
      resolve(row);
    });
  });
}

/**
 *
 * @param {Database} db - SQLite database object
 * @param {string} user
 * @param {string} email
 * @param {string} pass
 * @returns Promise<number> | Promise<Error>
 */
async function insertUser(db, email, pass) {
  return new Promise(function (resolve, reject) {
    db.run(
      "INSERT INTO user (email, pass) VALUES (?, ?)",
      [email, pass],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

async function deleteUser(db, email) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM user WHERE email = ?", email, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function closeDbConnection(db) {
  return new Promise((resolve, reject) => {
    db.close((error) => {
      if (error) {
        console.error("Error closing the database:", error.message);
        reject(error);
      } else {
        console.log("Database connection closed");
        resolve();
      }
    });
  });
}

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

async function deleteDbFile(filepath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (error) => {
        if (error) {
          console.error(error.message);
          reject(false);
        } else {
          console.log("Database file deleted");
          resolve(true);
        }
      });
    }
  });
}

function deleteTable(tableName, db) {
  db.exec(`DROP TABLE IF EXISTS ${tableName}`, (error) => {
    if (error) {
      return console.error(error.message);
    } else {
      console.log("Table deleted.");
    }
  });
}
