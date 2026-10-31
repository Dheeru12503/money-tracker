import { Schema, models, model } from "mongoose";

const LoanSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["borrowed", "lent"], required: true, index: true },
    person: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0.01 },
    dueDate: { type: Date },
    note: { type: String, trim: true, default: "" },
    settled: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

LoanSchema.index({ user: 1, dueDate: 1 });
export default models.Loan || model("Loan", LoanSchema);
