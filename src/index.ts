import express from "express";
import mysql from "mysql2";
import cors from 'cors';
import "reflect-metadata";
import apiRouter from './api/routes';

const app = express();
const port = 3300;


// === DATABASE CONNECTION ===
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "RimborsiDB",
});

conn.connect((err) => {
  if (err) {
    console.error("Errore connessione DB:", err);
    process.exit(1);
  }
  console.log("Connesso al database MySQL");
});

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("Benvenuto nel server Node.js!");
});


app.use('/api', apiRouter);

// === SERVER ===
app.listen(port, () => {
  console.log(`Server avviato su http://localhost:${port}`);
});