import { Router } from "express";
import { loginMethod, me, registerMethod } from "./user.controller";
import { validate } from "../../lib/validation-middleware";
import { UserDTO } from "./user.DTO";
import { isAuthentificated } from "../../lib/auth/local/auth.middleware";

const router = Router();

router.get("/me", isAuthentificated, me);
router.post("/register", validate(UserDTO), registerMethod);
router.post("/login", loginMethod);

export default router;