import { Router } from "express";
import { addProductToCart, purchaseCart } from "../controllers/cartController.js";


import { authMiddleware } from "../middlewares/auth.js";
import { checkRole } from "../middlewares/roles.js";
import Cart from "../models/Cart.js"; 


const router = Router();


router.post("/:cid/products", authMiddleware, checkRole(["user"]), addProductToCart);

router.post("/:cid/purchase", authMiddleware, checkRole(["user"]), purchaseCart);

router.post("/", authMiddleware, checkRole(["user"]), async (req, res) => {
    try {
        const cart = await Cart.create({ user: req.user._id, products: [] });
        res.status(201).json(cart);
    } catch (err) {
        res.status(500).json({ message: "Error al crear carrito", err });
    }
});




export default router;
