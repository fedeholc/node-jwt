import sqlite3 from "sqlite3";

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
  static db = null;

  constructor(dbURI) {
    super();
    this.dbURI = dbURI;
    this.init();
  }

  async init() {
    dbSqlite3.db = await this.#getDbInstance(this.dbURI);
    console.log("DBx", dbSqlite3.db, this.dbURI);
  }

  async #getDbInstance(dbURI) {
    if (dbSqlite3.db) {
      return dbSqlite3.db; // Retorna la instancia existente si ya está creada
    }
    return new Promise((resolve, reject) => {
      console.log("DB URI", dbURI);
      this.createDbConnection(dbURI)
        .then((instance) => {
          resolve(instance);
        })
        .catch(reject);
    });
  }

  async deleteUser(email) {
    return new Promise((resolve, reject) => {
      dbSqlite3.db.run("DELETE FROM user WHERE email = ?", email, (error) => {
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
      dbSqlite3.db.run(
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
    console.log("this db", dbSqlite3.db);
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
    console.log("this db", dbSqlite3.db);
    return new Promise((resolve, reject) => {
      dbSqlite3.db.get(
        "SELECT * FROM user WHERE email = ?",
        email,
        (error, row) => {
          if (error) {
            console.log("Error getting user by email", error);
            reject(error);
          }
          console.log("Row", row);
          resolve(row);
        }
      );
    });
  }
  async createDbConnection(filepath) {
    return new Promise((resolve, reject) => {
      let instance = new sqlite3.Database(filepath, (error) => {
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

  closeDbConnection() {
    return new Promise((resolve, reject) => {
      dbSqlite3.db.close((error) => {
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
    console.log("this db en insert user", dbSqlite3.db);
    return new Promise((resolve, reject) => {
      dbSqlite3.db.run(
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
  constructor(turso) {
    super();
    this.turso = turso;
  }

  async getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.turso
        .query("SELECT * FROM user WHERE email = ?", [email])
        .then((result) => {
          resolve(result);
        })
        .catch(reject);
    });
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
}
