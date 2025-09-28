import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Ticket from "../models/Ticket.js";


export const addProductToCart = async (req, res) => {
    const { cid } = req.params;
    const { productId, quantity } = req.body;

    try {
        const cart = await Cart.findById(cid);
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Producto no encontrado" });

        const existing = cart.products.find(p => p.product.toString() === productId);
        if (existing) existing.quantity += quantity;
        else cart.products.push({ product: productId, quantity });

        await cart.save();
        res.json({ message: "Producto agregado al carrito", cart });
    } catch (err) {
        res.status(500).json({ message: "Error al agregar producto", err });
    }
};


export const purchaseCart = async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await Cart.findById(cid).populate("products.product");

        let total = 0;
        for (const item of cart.products) {
            if (item.quantity > item.product.stock) return res.status(400).json({ message: `Stock insuficiente para ${item.product.title}` });
            total += item.product.price * item.quantity;
            item.product.stock -= item.quantity;
            await item.product.save();
        }

        const ticket = await Ticket.create({
            code: `T-${Date.now()}`,
            purchase_datetime: new Date(),
            amount: total,
            purchaser: req.user._id
        });

        cart.products = [];
        await cart.save();
        const populatedTicket = await Ticket.findById(ticket._id).populate("purchaser", "email");
        res.json({ message: "Compra realizada", ticket: populatedTicket });

        
    } catch (err) {
        res.status(500).json({ message: "Error al generar ticket", err });
    }
};
