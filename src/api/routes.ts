import { Router } from "express";
import userRouter from './user/user.router';
import rimborsiRouter from './rimborsi/rimborsi.router';
import categorieRouter from './categorie/categorie.router';
const router = Router();

router.use('/utenti', userRouter);
router.use('/rimborsi', rimborsiRouter);
router.use('/categoria-spesa', categorieRouter);
export default router;