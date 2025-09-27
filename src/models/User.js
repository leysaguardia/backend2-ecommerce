import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, default: "user" },
    cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

export default mongoose.model("User", userSchema);

