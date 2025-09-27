import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendResetEmail = async (to, token) => {
    const link = `http://localhost:${process.env.PORT}/api/auth/reset-password/${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: "Restablecer contraseña",
        html: `<p>Haz click <a href="${link}">aquí</a> para restablecer tu contraseña. El enlace expira en 1 hora.</p>`
    });
};
