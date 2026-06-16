import mysql from "mysql2/promise";

export const createConnection = async () => {
  return await mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "password",
    database: "RimborsiDB",
  });
};