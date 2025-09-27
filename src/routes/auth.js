import { register, login, current, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { Router } from "express";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/current", authMiddleware, current);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;

