import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../jwt/jwt-strategy";

export interface AuthentificationRequest extends Request {
  user?: any;
}

export const isAuthentificated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token mancante o non valido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(token, JWT_SECRET) as any;
    req.user = decodedToken;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token scaduto o non valido" });
  }
};