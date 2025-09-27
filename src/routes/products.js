import { Router } from "express";
import { getProducts, createProduct } from "../controllers/productController.js";
import { authMiddleware } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roles.js";

const router = Router();

router.get("/", getProducts);
router.post("/", authMiddleware, checkRole(["admin"]), createProduct);

export default router;
