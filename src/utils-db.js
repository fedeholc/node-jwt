export {
  insertUser,
  getUserByEmail,
  createDbConnection,
  deleteDbFile,
  deleteTable,
  closeDbConnection,
};

import fs from "fs";
import sqlite3 from "sqlite3";

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
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns Promise<number> | Promise<Error>
 */
async function insertUser(db, username, email, password) {
  return new Promise(function (resolve, reject) {
    db.run(
      "INSERT INTO user (user, email, pass) VALUES (?, ?, ?)",
      [username, email, password],
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
function createDbConnection(filepath) {
  if (fs.existsSync(filepath)) {
    console.log("Database exists");
  } else {
    console.log("Creating database2");
  }
  try {
    let db = new sqlite3.Database(filepath, (error) => {
      if (error) {
        console.error("Error creating database:", error.message);
      } else {
        console.log("Connection with SQLite has been established");
      }
    });
    console.log("Database object created:", db);
    return db;
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
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
