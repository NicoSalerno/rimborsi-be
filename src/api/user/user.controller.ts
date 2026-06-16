import { Request, Response, NextFunction } from "express";
import { createConnection } from "../connection";
import bcrypt from "bcrypt";
import { TypedRequest } from "../../lib/typed-request.interface";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../lib/auth/jwt/jwt-strategy";
import { UserDTO } from "./user.DTO";

export const me = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: 'Utente non autenticato' });
  }

  return res.json({
    id: user.UtenteID,
    nome: user.Nome,
    cognome: user.Cognome,
    email: user.Email,
    ruolo: user.Ruolo,
  });
};

export const registerMethod = async (
  req: TypedRequest<UserDTO>,
  res: Response,
  next: NextFunction
) => {
  const { nome, cognome, email, ruolo, password } = req.body;

  if (!nome || !cognome || !email || !ruolo || !password) {
    return res.status(400).json({ error: "Inserire tutti i parametri" });
  }

  if (ruolo !== 'dipendente' && ruolo !== 'responsabile') {
    return res.status(400).json({ error: "Ruolo deve essere 'dipendente' o 'responsabile'" });
  }

  const conn = await createConnection();

  const [users] = await conn.query("SELECT * FROM `Utente` WHERE Email = ?", [email]);
  if ((users as any[]).length > 0) {
    return res.status(409).json({
      success: false,
      message: "Email già esistente"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await conn.query(
    "INSERT INTO `Utente` (Nome, Cognome, Email, Ruolo, Password) VALUES (?, ?, ?, ?, ?)",
    [nome, cognome, email, ruolo, hashedPassword]
  );

  return res.status(201).json({
    success: true,
    message: "Utente creato con successo"
  });
};

export const loginMethod = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({ error: "Inserire tutti i parametri" });
  }

  const conn = await createConnection();

  try {
    const [users] = await conn.query("SELECT * FROM `Utente` WHERE Email = ?", [email]);

    if ((users as any[]).length === 0) {
      return res.status(401).json({ error: "Utente non trovato" });
    }

    const user = (users as any[])[0];

    const matchedPassword = await bcrypt.compare(password, user.Password);

    if (!matchedPassword) {
      return res.status(401).json({ error: "Password errata" });
    }

    const payload = {
      UtenteID: user.UtenteID,
      Nome: user.Nome,
      Cognome: user.Cognome,
      Email: user.Email,
      Ruolo: user.Ruolo,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30m" });

    return res.status(200).json({
      success: true,
      message: "Login riuscito",
      token: token,
      user: {
        id: user.UtenteID,
        nome: user.Nome,
        cognome: user.Cognome,
        ruolo: user.Ruolo,
        email: user.Email,
      },
    });
  } catch (err: any) {
    next(err);
  }
};