import Twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const client = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export const sendSMS = async (to, body) => {
    try {
        const message = await client.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });
        return message;
    } catch (error) {
        console.error("Error enviando SMS:", error);
        throw error;
    }
};
