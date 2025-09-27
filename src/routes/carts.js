import { Router } from "express";
import { addToCart, purchaseCart } from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roles.js";

const router = Router();

router.post("/add", authMiddleware, checkRole(["user"]), addToCart);
router.post("/purchase", authMiddleware, checkRole(["user"]), purchaseCart);

export default router;
