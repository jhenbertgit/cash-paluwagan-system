import { Schema, model, models, Model } from "mongoose";

export interface ITransaction {
  checkoutSessionId: string;
  amount: number;
  member: Schema.Types.ObjectId;
  status: "completed" | "failed" | "pending";
  paymentMethod?: string;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
  contributionCycle: number;
  contributionYear: number;
  nextContributionDate: Date;
  calculateNextContributionDate(): Date;
}

interface TransactionModel extends Model<ITransaction> {
  deleteUserTransactions(userId: string): Promise<void>;
}

const TransactionSchema = new Schema<ITransaction>({
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
  contributionCycle: {
    type: Number,
    required: true,
  },
  contributionYear: {
    type: Number,
    required: true,
  },
  nextContributionDate: {
    type: Date,
    required: true,
  },
});

// Update the updatedAt field on every save
TransactionSchema.pre("save", function (next) {
  if (this.isNew) {
    const date = new Date(this.createdAt);
    this.contributionCycle = date.getMonth() + 1;
    this.contributionYear = date.getFullYear();
    this.nextContributionDate = new Date(date.setMonth(date.getMonth() + 1));
  }
  this.updatedAt = new Date();
  next();
});

// Add middleware to handle user deletion
TransactionSchema.statics.deleteUserTransactions = async function (userId) {
  await this.deleteMany({ member: userId });
};

// Add method to calculate next payment date
TransactionSchema.methods.calculateNextContributionDate = function () {
  const nextDate = new Date(this.createdAt);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
};

const Transaction = (models.Transaction ||
  model("Transaction", TransactionSchema)) as TransactionModel;

export default Transaction;
