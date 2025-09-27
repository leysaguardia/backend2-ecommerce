import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: Number,
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

export default mongoose.model("Ticket", ticketSchema);
