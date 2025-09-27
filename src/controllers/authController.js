import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserDTO from "../dtos/userDto.js";
import crypto from "crypto";
import { sendResetEmail } from "../services/mailService.js";

// Registro
export const register = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const user = await User.create({ first_name, last_name, email, password: hashed });
    res.json({ message: "Usuario registrado", user: new UserDTO(user) });
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
};

// Ruta /current
export const current = (req, res) => {
    res.json(new UserDTO(req.user));
};

// Solicitar recuperación
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    await sendResetEmail(email, token);
    res.json({ message: "Correo de recuperación enviado" });
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({ 
        resetPasswordToken: token, 
        resetPasswordExpires: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    const samePassword = bcrypt.compareSync(newPassword, user.password);
    if (samePassword) return res.status(400).json({ message: "No puedes usar la misma contraseña" });

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Contraseña restablecida con éxito" });
};
