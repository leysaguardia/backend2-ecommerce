import Product from "../models/Product.js";


export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error al listar productos", err });
    }
};


export const createProduct = async (req, res) => {
    try {
        const { title, description, price, stock, category, thumbnails } = req.body;
        const product = await Product.create({ title, description, price, stock, category, thumbnails });
        res.status(201).json({ message: "Producto creado", product });
    } catch (err) {
        res.status(500).json({ message: "Error al crear producto", err });
    }
};

