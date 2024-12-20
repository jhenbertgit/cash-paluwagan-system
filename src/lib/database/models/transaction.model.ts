/*eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, models, Model } from "mongoose";

interface TransactionModel extends Model<any> {
  deleteUserTransactions(userId: string): Promise<void>;
}

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

// Add middleware to handle user deletion
TransactionSchema.statics.deleteUserTransactions = async function (userId) {
  await this.deleteMany({ member: userId });
};

const Transaction = (models.Transaction ||
  model("Transaction", TransactionSchema)) as TransactionModel;

export default Transaction;
