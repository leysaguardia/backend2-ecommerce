import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserDTO from "../dtos/userDto.js";
import { sendSMS } from "../services/twilioService.js";
import { sendEmail } from "../services/mailService.js";

// Registro de usuario
export const register = async (req, res) => {
    try {
        const { first_name, last_name, email, phone, password } = req.body;
        const hashed = bcrypt.hashSync(password, 10);

        const user = await User.create({ first_name, last_name, email, phone, password: hashed, role: "user" });

        res.status(201).json({ message: "Usuario registrado", user: new UserDTO(user) });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar usuario", error });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const valid = bcrypt.compareSync(password, user.password);
        if (!valid) return res.status(401).json({ message: "Contraseña incorrecta" });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error en login", error });
    }
};

// Endpoint protegido /current
export const current = (req, res) => {
    res.json(new UserDTO(req.user));
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
    try {
        const { email, phone } = req.body;
        const user = await User.findOne({ $or: [{ email }, { phone }] });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        const token = crypto.randomBytes(20).toString("hex");
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // Enviar correo
        await sendEmail(email, "Recuperar contraseña", `<p>Tu código de recuperación es: ${token}</p>`);

        // Enviar SMS
        await sendSMS(phone, `Tu código de recuperación es: ${token}`);

        res.json({ message: "Código de recuperación enviado por email y SMS" });
    } catch (error) {
        res.status(500).json({ message: "Error al solicitar recuperación", error });
    }
};

// Restablecer contraseña
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

        const samePassword = bcrypt.compareSync(newPassword, user.password);
        if (samePassword) return res.status(400).json({ message: "No puedes usar la misma contraseña" });

        user.password = bcrypt.hashSync(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Contraseña restablecida con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
};
