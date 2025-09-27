// ejemplo de middleware
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "No token" });

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        req.user = user; // <-- asegurate que `user` tiene first_name, last_name, email, role
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

