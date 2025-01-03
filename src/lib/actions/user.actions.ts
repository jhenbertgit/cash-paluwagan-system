"use server";

import User from "../database/models/user.model";
import Transaction from "../database/models/transaction.model";
import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import { connectToDB } from "../database/mongoose";
import type { Document } from "mongoose";

interface UserStats {
  totalUsers: number;
  newestUser: Date | null;
  oldestUser: Date | null;
  activeUsers: number;
  activeUsersPercentage: number;
}

type UserDocument = Document & CreateUserParams;

const DEFAULT_STATS: UserStats = {
  totalUsers: 0,
  newestUser: null,
  oldestUser: null,
  activeUsers: 0,
  activeUsersPercentage: 0,
};

const serializeUser = (user: UserDocument | null) =>
  user ? JSON.parse(JSON.stringify(user)) : null;

/**
 * Creates a new user in the database
 */
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDB();
    const newUser = await User.create(user);
    return serializeUser(newUser);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Retrieves a user by their Clerk ID
 */
export async function getUserById(
  userId: string
): Promise<{ user: UserDocument | null; redirection: boolean }> {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId }).select("-__v");

    if (!user) {
      return { user: null, redirection: true };
    }

    return { user: serializeUser(user), redirection: false };
  } catch (error) {
    handleError(error);
    return { user: null, redirection: true }; // Return redirect status on error
  }
}

/**
 * Updates user information in the database
 */
export async function updateUser(clerkId: string, userData: UpdateUserParams) {
  try {
    await connectToDB();
    const updatedUser = await User.findOneAndUpdate({ clerkId }, userData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error("User update failed");
    }

    return serializeUser(updatedUser);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes a user from the database
 */
export async function deleteUser(clerkId: string) {
  try {
    await connectToDB();

    const userToDelete = await User.findOne({ clerkId });
    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user's transactions first
    await Transaction.deleteUserTransactions(userToDelete._id);

    // Then delete the user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return serializeUser(deletedUser);
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get total registered users and their statistics
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    await connectToDB();

    const userCount = await User.countDocuments();
    if (!userCount) return DEFAULT_STATS;

    const aggregationPipeline = [
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          newestUser: { $max: "$createdAt" },
          oldestUser: { $min: "$createdAt" },
          activeUsers: {
            $sum: { $cond: [{ $gt: ["$creditBalance", 0] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalUsers: { $ifNull: ["$totalUsers", 0] },
          newestUser: { $ifNull: ["$newestUser", null] },
          oldestUser: { $ifNull: ["$oldestUser", null] },
          activeUsers: { $ifNull: ["$activeUsers", 0] },
          activeUsersPercentage: {
            $multiply: [
              {
                $divide: [
                  { $ifNull: ["$activeUsers", 0] },
                  { $max: [{ $ifNull: ["$totalUsers", 1] }, 1] },
                ],
              },
              100,
            ],
          },
        },
      },
    ];

    const [stats] = await User.aggregate(aggregationPipeline);
    return stats || DEFAULT_STATS;
  } catch (error) {
    handleError(error);
    return DEFAULT_STATS;
  }
}

/**
 * Get simple count of total users
 */
export async function getTotalUsers(): Promise<number> {
  try {
    await connectToDB();
    return (await User.countDocuments()) || 0;
  } catch (error) {
    handleError(error);
    return 0;
  }
}
