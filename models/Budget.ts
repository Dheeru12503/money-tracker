import mongoose, { Schema, models, model } from "mongoose";

const BudgetSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
}, { timestamps: true });
BudgetSchema.index({ user: 1, month: 1 }, { unique: true });
export default models.Budget || model("Budget", BudgetSchema);
