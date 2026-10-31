import mongoose, { Schema, models, model } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default models.User || model("User", UserSchema);
