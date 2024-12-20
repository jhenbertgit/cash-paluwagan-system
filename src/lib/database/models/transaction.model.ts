import { Schema, model, models } from "mongoose";

const TransactionSchema = new Schema({
  checkoutSessionId: {
    type: String,
    required: true,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  member: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["completed", "failed", "pending"],
    default: "pending",
    required: true,
  },
  paymentMethod: {
    type: String,
  },
  error: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on every save
TransactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Add middleware to handle cascade delete
TransactionSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function () {
    await this.model("Transaction").deleteMany({ member: this._id });
  }
);

const Transaction =
  models.Transaction || model("Transaction", TransactionSchema);

export default Transaction;
