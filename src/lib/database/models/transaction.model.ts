import { Schema, model, models, Model } from "mongoose";

export interface ITransaction {
  checkoutSessionId: string;
  amount: number;
  member: Schema.Types.ObjectId;
  status: "completed" | "failed" | "pending";
  paymentMethod: string;
  error?: string | null;
  contributionCycle?: number;
  contributionYear?: number;
  nextContributionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  contributionCycle: {
    type: Number,
  },
  contributionYear: {
    type: Number,
  },
  nextContributionDate: {
    type: Date,
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
  if (this.isNew) {
    const date = new Date(this.createdAt);
    this.contributionCycle = date.getMonth() + 1;
    this.contributionYear = date.getFullYear();
    const nextMonth = new Date(date.setMonth(date.getMonth() + 1));
    this.nextContributionDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      30
    );
  }
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
