import mongoose, { Schema, models, model } from "mongoose";

const ExpenseSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, required: true, index: true },
  description: String,
  date: { type: Date, required: true, index: true },
  paymentMethod: { type: String, enum: ["Cash", "UPI", "Debit Card", "Credit Card", "Other"], required: true },
  notes: String,
}, { timestamps: true });

ExpenseSchema.index({ user: 1, date: -1 });
export default models.Expense || model("Expense", ExpenseSchema);
