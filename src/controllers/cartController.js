import Cart from "../models/Cart.js";
import Product from  "../models/Product.js";
import Ticket from "../models/Ticket.js";

export const addToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({user: userId});
    if(!cart){
        cart = await Cart.create({user: userId, products: []});
    }

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if(index !== -1){
        cart.products[index].quantity += quantity;
    } else {
        cart.products.push({product: productId, quantity});
    }

    await cart.save();
    res.json({message: "Producto agregado al carrito", cart});
};

export const purchaseCart = async (req, res) => {
    const userId = req.user.id;
    const cart = await Cart.findOne({user: userId}).populate("products.product");

    if(!cart || cart.products.length === 0){
        return res.status(400).json({message: "Carrito vacío"});
    }

    let total = 0;
    for(let item of cart.products){
        if(item.quantity > item.product.stock){
            return res.status(400).json({message: `Stock insuficiente para ${item.product.title}`});
        }
        total += item.product.price * item.quantity;
        item.product.stock -= item.quantity;
        await item.product.save();
    }

    const ticket = await Ticket.create({
        code: Math.random().toString(36).substring(2, 10),
        amount: total,
        purchaser: userId
    });

    cart.products = [];
    await cart.save();

    res.json({message: "Compra realizada", ticket});
};
