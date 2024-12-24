"use server";

/*eslint-disable @typescript-eslint/no-explicit-any */
import Transaction from "../database/models/transaction.model";
import User from "../database/models/user.model";
import mongoose from "mongoose";
import { handleError } from "../utils";
import { redirect } from "next/navigation";
import { connectToDB } from "../database/mongoose";
import { PipelineStage, Types } from "mongoose";

/**
 * Processes a payment checkout through PayMongo payment gateway
 * @param {CheckoutTransactionParams} params - The checkout parameters
 * @throws {Error} When PayMongo secret key or server URL is missing
 * @throws {Error} When checkout session creation fails
 * @throws {Error} When checkout URL is missing in PayMongo response
 */
export async function processContribution({
  name,
  email,
  userId,
}: CheckoutTransactionParams) {
  const secretKey = process.env.PAYMONGO_SECRET;
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

  // Validate environment variables
  if (!secretKey || !serverUrl) {
    throw new Error(
      !secretKey ? "PayMongo secret key is missing" : "Server URL is missing"
    );
  }

  const PAYMONGO_API_URL = "https://api.paymongo.com/v1/checkout_sessions";
  const AMOUNT = 100000;

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      authorization: `Basic ${Buffer.from(secretKey).toString("base64")}`,
    },
    body: JSON.stringify({
      data: {
        attributes: {
          billing: { name, email },
          send_email_receipt: false,
          show_description: true,
          show_line_items: true,
          line_items: [
            {
              currency: "PHP",
              quantity: 1,
              name: "Paluwagan",
              amount: AMOUNT,
            },
          ],
          payment_method_types: ["gcash", "grab_pay", "paymaya", "card"],
          description: "Paluwagan monthly contribution",
          success_url: `${serverUrl}/dashboard`,
          cancel_url: `${serverUrl}/pay`,
          metadata: {
            memberId: userId,
          },
        },
      },
    }),
  };

  try {
    const response = await fetch(PAYMONGO_API_URL, options);

    if (!response.ok) {
      throw new Error(
        `Failed to create checkout session: ${response.statusText}`
      );
    }

    const session = await response.json();
    const checkoutUrl = session?.data?.attributes?.checkout_url;

    if (!checkoutUrl) {
      throw new Error("Checkout URL is missing in the PayMongo response");
    }

    redirect(checkoutUrl);
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "NEXT_REDIRECT") {
      console.error("An error occurred during checkout:", error);
      throw error;
    }
    throw error;
  }
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDB();

    const newTransaction = await Transaction.create({
      ...transaction,
      member: transaction.memberId,
    });

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves all transactions from the database
 * @turns {Promise<object[]>} Array of transaction objects
 * @throws {Error} When database connection or query fails
 */
export async function getTransactions() {
  try {
    await connectToDB();
    // Get all transactions, sorted by creation date (newest first)
    const transactions = await Transaction.find({})
      .populate("member", "firstName lastName email") // Populate member details
      .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

/**
 * Retrieves transactions for a specific member
 * @param {string} memberId - The member's ID
 * @returns {Promise<object[]>} Array of member's transactions
 */
export async function getMemberTransactions(memberId: string): Promise<any> {
  try {
    await connectToDB();

    // Convert string memberId to ObjectId
    const memberObjectId = new Types.ObjectId(memberId);

    const transactions = await Transaction.find({ member: memberObjectId })
      .populate("member", "firstName lastName email")
      .sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    console.error("Error fetching member transactions:", error);
    throw error;
  }
}

/**
 * Get transaction statistics
 * @returns {Promise<object>} Transaction statistics
 */
export async function getTransactionStats(): Promise<any> {
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
 * @returns {Promise<object>} Transaction statistics
 */
export async function getMemberContributionStats(
  memberId?: string
): Promise<any> {
  try {
    await connectToDB();

    const memberObjectId = memberId ? new Types.ObjectId(memberId) : undefined;

    // Check if user exists first
    if (memberId) {
      const userExists = await User.findById(memberObjectId);
      if (!userExists) {
        const defaultStats = {
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

    const defaultStats = {
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
      ? stats[0] || defaultStats
      : stats.length
      ? stats
      : [defaultStats];
  } catch (error) {
    console.error("Error fetching member transaction stats:", error);
    throw error;
  }
}

/**
 * Get monthly transaction statistics for a member
 * @param {string} memberId - Member ID
 * @returns {Promise<object[]>} Monthly transaction statistics
 */
export async function getMemberMonthlyStats(memberId: string) {
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

    return monthlyStats;
  } catch (error) {
    handleError(error);
    return [];
  }
}

/**
 * Get transaction summary for dashboard
 * @returns {Promise<object>} Transaction summary statistics
 */
export async function getContributionSummary(): Promise<any> {
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

export async function getTransactionsByMember(
  memberId: string,
  limit?: number
): Promise<any> {
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
    return JSON.parse(JSON.stringify(transactions));
  } catch (error) {
    handleError(error);
    return [];
  }
}
