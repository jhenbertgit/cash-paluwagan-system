"use server";

import User from "../database/models/user.model";
import mongoose, { PipelineStage, Types } from "mongoose";
import Transaction, {
  ITransaction,
} from "../database/models/transaction.model";
import { handleError } from "../utils";
import { connectToDB } from "../database/mongoose";

/**
 * Creates a new transaction in the database
 * @param {CreateTransactionParams} transaction - The transaction parameters
 * @returns {Promise<object>} The created transaction object
 * @throws {Error} When database connection or transaction creation fails
 */
export async function createTransaction(
  transaction: CreateTransactionParams
): Promise<object> {
  try {
    await connectToDB();

    const newTransaction = await Transaction.create({
      ...transaction,
      member: transaction.memberId,
    });

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
    return {};
  }
}



/**
 * Retrieves all transactions from the database
 * @returns {Promise<PopulatedTransaction[]>} Array of transaction objects
 * @throws {Error} When database connection or query fails
 */
export async function getTransactions(): Promise<PopulatedTransaction[]> {
  try {
    await connectToDB();
    // Get all transactions, sorted by creation date (newest first)
    const transactions = await Transaction.find({})
      .populate("member", "firstName lastName email") // Populate member details
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(transactions)) as PopulatedTransaction[];
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

/**
 * Retrieves transactions for a specific member
 * @param {string} memberId - The member's ID
 * @returns {Promise<ITransaction[]>} Array of member's transactions
 */
export async function getMemberTransactions(
  memberId: string
): Promise<ITransaction[]> {
  try {
    await connectToDB();

    // Convert string memberId to ObjectId
    const memberObjectId = new Types.ObjectId(memberId);

    const transactions = await Transaction.find({ member: memberObjectId })
      .populate("member", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Properly serialize the MongoDB documents
    return JSON.parse(JSON.stringify(transactions)) as ITransaction[];
  } catch (error) {
    console.error("Error fetching member transactions:", error);
    throw error;
  }
}

/**
 * Get transaction statistics
 * @returns {Promise<TransactionStats>} Transaction statistics
 */
export async function getTransactionStats(): Promise<TransactionStats> {
  try {
    await connectToDB();
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$amount" },
        },
      },
    ]);
    return stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 };
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    throw error;
  }
}

/**
 * Get transaction statistics per member
 * @param {string} memberId - Optional member ID to filter stats for specific member
 * @returns {Promise<MemberContributionStats | MemberContributionStats[]>} Transaction statistics
 */
export async function getMemberContributionStats(
  memberId?: string
): Promise<MemberContributionStats | MemberContributionStats[]> {
  try {
    await connectToDB();

    const memberObjectId = memberId ? new Types.ObjectId(memberId) : undefined;

    // Check if user exists first
    if (memberId) {
      const userExists = await User.findById(memberObjectId);
      if (!userExists) {
        const defaultStats: MemberContributionStats = {
          memberId: memberObjectId || null,
          memberName: "Unknown User",
          email: "N/A",
          totalAmount: 0,
          transactionCount: 0,
          averageAmount: 0,
          lastTransaction: null,
          completedTransactions: 0,
          failedTransactions: 0,
          pendingTransactions: 0,
          successRate: 0,
        };
        return memberId ? defaultStats : [defaultStats];
      }
    }

    const pipeline: PipelineStage[] = [
      ...(memberObjectId
        ? [{ $match: { member: memberObjectId } } as PipelineStage]
        : []),
      {
        $group: {
          _id: "$member",
          totalAmount: { $sum: "$amount" },
          transactionCount: { $sum: 1 },
          averageAmount: { $avg: "$amount" },
          lastTransaction: { $max: "$createdAt" },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          failedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
        },
      } as PipelineStage,
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "memberDetails",
        },
      } as PipelineStage,
      {
        $unwind: "$memberDetails",
      } as PipelineStage,
      {
        $project: {
          memberId: "$_id",
          memberName: {
            $concat: [
              "$memberDetails.firstName",
              " ",
              "$memberDetails.lastName",
            ],
          },
          email: "$memberDetails.email",
          totalAmount: { $round: ["$totalAmount", 2] },
          transactionCount: 1,
          averageAmount: { $round: ["$averageAmount", 2] },
          lastTransaction: 1,
          completedTransactions: 1,
          failedTransactions: 1,
          pendingTransactions: 1,
          successRate: {
            $multiply: [
              {
                $divide: [
                  "$completedTransactions",
                  { $max: ["$transactionCount", 1] },
                ],
              },
              100,
            ],
          },
        },
      } as PipelineStage,
      {
        $sort: { totalAmount: -1 },
      } as PipelineStage,
    ];

    const stats = await Transaction.aggregate(pipeline);

    const defaultStats: MemberContributionStats = {
      memberId: memberObjectId || null,
      memberName: "Unknown User",
      email: "N/A",
      totalAmount: 0,
      transactionCount: 0,
      averageAmount: 0,
      lastTransaction: null,
      completedTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      successRate: 0,
    };

    return memberId
      ? (stats[0] as MemberContributionStats) || defaultStats
      : stats.length
      ? (stats as MemberContributionStats[])
      : [defaultStats];
  } catch (error) {
    console.error("Error fetching member transaction stats:", error);
    throw error;
  }
}

/**
 * Get monthly transaction statistics for a member
 * @param {string} memberId - Member ID
 * @returns {Promise<MonthlyTransactionStats[]>} Monthly transaction statistics
 */
export async function getMemberMonthlyStats(
  memberId: string
): Promise<MonthlyTransactionStats[]> {
  try {
    await connectToDB();

    const monthlyStats = await Transaction.aggregate([
      {
        $match: {
          member: new mongoose.Types.ObjectId(memberId),
          status: "completed",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1,
            },
          },
          totalAmount: 1,
          count: 1,
        },
      },
      {
        $sort: { month: 1 },
      },
    ]);

    return monthlyStats as MonthlyTransactionStats[];
  } catch (error) {
    handleError(error);
    return [];
  }
}

/**
 * Get transaction summary for dashboard
 * @returns {Promise<TransactionSummary>} Transaction summary statistics
 */
export async function getContributionSummary(): Promise<TransactionSummary> {
  try {
    await connectToDB();

    const summary = await Transaction.aggregate([
      // Group all transactions
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
          completedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0],
            },
          },
          completedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          averageAmount: { $avg: "$amount" },
          minAmount: { $min: "$amount" },
          maxAmount: { $max: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: { $round: [{ $ifNull: ["$totalAmount", 0] }, 2] },
          totalTransactions: { $ifNull: ["$totalTransactions", 0] },
          completedAmount: {
            $round: [{ $ifNull: ["$completedAmount", 0] }, 2],
          },
          completedCount: { $ifNull: ["$completedCount", 0] },
          averageAmount: { $round: [{ $ifNull: ["$averageAmount", 0] }, 2] },
          minAmount: { $round: [{ $ifNull: ["$minAmount", 0] }, 2] },
          maxAmount: { $round: [{ $ifNull: ["$maxAmount", 0] }, 2] },
          successRate: {
            $multiply: [
              {
                $divide: [
                  { $ifNull: ["$completedCount", 0] },
                  { $max: [{ $ifNull: ["$totalTransactions", 1] }, 1] },
                ],
              },
              100,
            ],
          },
        },
      },
    ]);

    // Provide default values if no data exists
    return (
      summary[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        completedAmount: 0,
        completedCount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        successRate: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    throw error;
  }
}

/**
 * Retrieves transactions for a specific member with optional limit
 * @param {string} memberId - The ID of the member to fetch transactions for
 * @param {number} [limit] - Optional maximum number of transactions to return
 * @returns {Promise<TransactionDocument[]>} Array of member's transactions, sorted by creation date (newest first)
 * @throws {Error} When database connection or query fails
 */
export async function getTransactionsByMember(
  memberId: string,
  limit?: number
): Promise<ITransaction[]> {
  try {
    await connectToDB();

    const query = Transaction.find({ member: memberId }).sort({
      createdAt: -1,
    });

    if (limit) {
      query.limit(limit);
    }

    const transactions = await query.exec();
    // Properly serialize the MongoDB documents
    return JSON.parse(JSON.stringify(transactions)) as ITransaction[];
  } catch (error) {
    handleError(error);
    return [];
  }
}
