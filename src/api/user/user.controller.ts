import { Request, Response, NextFunction } from "express";

export const me = async (
    req: Request, 
    res: Response, 
    next: NextFunction) => {
    
    res.json(req.user);
}