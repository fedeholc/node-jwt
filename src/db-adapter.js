class DBInterface {
  connect() {
    throw new Error("El método 'connect()' debe ser implementado");
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

import sqlite3 from "sqlite3";

export class dbSqlite3 extends DBInterface {
  constructor() {
    super();
    this.db = null;
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
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM user WHERE email = ?", email, (error, row) => {
        if (error) {
          reject(error);
        }
        resolve(row);
      });
    });
  }
  async connect(filepath) {
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

  async insertUser(email, pass) {
    return new Promise(function (resolve, reject) {
      this.db.run(
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
}
