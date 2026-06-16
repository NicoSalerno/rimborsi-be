import { Request, Response, NextFunction } from "express";
import { createConnection } from "../connection";

export const getCategorie = async (req: Request, res: Response, next: NextFunction) => {

  const conn = await createConnection();
  
  try{
    let query = `SELECT * FROM CategoriaSpesa`

    const [rows] = await conn.query(query);
    return res.json(rows);
  }catch(err: any){
    next(err);
  }
}