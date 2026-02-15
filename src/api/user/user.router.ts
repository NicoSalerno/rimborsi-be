import { Router } from "express";
import { isAuthenticated } from "../../lib/auth/auth.middleware";
import { me } from "./user.controller";

const router = Router();

router.get('/me', isAuthenticated, me );

export default router;