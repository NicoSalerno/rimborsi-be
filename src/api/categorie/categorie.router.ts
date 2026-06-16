import { Router } from "express";
import { isAuthentificated } from "../../lib/auth/local/auth.middleware";
import { getCategorie } from "./categorie.controller";

const router = Router();

router.use(isAuthentificated);
router.get('', getCategorie)
export default router;