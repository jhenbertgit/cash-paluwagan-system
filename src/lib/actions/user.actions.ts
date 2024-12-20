"use server";

/*eslint-disable @typescript-eslint/no-explicit-any */
import User from "../database/models/user.model";

import { revalidatePath } from "next/cache";
import { handleError } from "../utils";
import { connectToDB } from "../database/mongoose";

/**
 * Creates a new user in the database
 * @async
 * @param {CreateUserParams} user - User creation parameters
 * @returns {Promise<Object>} Newly created user object
 * @throws {Error} When database connection or user creation fails
 */
export async function createUser(user: CreateUserParams): Promise<any> {
  try {
    await connectToDB();

    const newUser = await User.create(user);

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Retrieves a user by their Clerk ID
 * @async
 * @param {string} userId - Clerk user ID
 * @returns {Promise<Object>} User object if found
 * @throws {Error} When user is not found or database connection fails
 */
export async function getUserById(userId: string): Promise<any> {
  try {
    await connectToDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) throw new Error("User not found");

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Updates user information in the database
 * @async
 * @param {string} clerkId - Clerk user ID
 * @param {UpdateUserParams} user - Updated user parameters
 * @returns {Promise<Object>} Updated user object
 * @throws {Error} When update fails or user is not found
 */
export async function updateUser(
  clerkId: string,
  user: UpdateUserParams
): Promise<any> {
  try {
    await connectToDB();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

/**
 * Deletes a user from the database
 * @async
 * @param {string} clerkId - Clerk user ID
 * @returns {Promise<Object|null>} Deleted user object or null
 * @throws {Error} When user is not found or deletion fails
 */
export async function deleteUser(clerkId: string): Promise<any | null> {
  try {
    await connectToDB();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}

/**
 * Get total registered users and their statistics
 * @returns {Promise<object>} User statistics
 */
export async function getUserStats(): Promise<any> {
  try {
    await connectToDB();

    // Get basic user stats
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          // Get newest and oldest user by registration date
          newestUser: { $max: "$createdAt" },
          oldestUser: { $min: "$createdAt" },
          // Optional: Count users by status or other criteria
          activeUsers: {
            $sum: {
              $cond: [{ $gt: ["$creditBalance", 0] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalUsers: 1,
          newestUser: 1,
          oldestUser: 1,
          activeUsers: 1,
          // Calculate percentage of active users
          activeUsersPercentage: {
            $multiply: [
              {
                $divide: ["$activeUsers", { $max: ["$totalUsers", 1] }],
              },
              100,
            ],
          },
        },
      },
    ]);

    return (
      stats[0] || {
        totalUsers: 0,
        newestUser: null,
        oldestUser: null,
        activeUsers: 0,
        activeUsersPercentage: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

/**
 * Get simple count of total users
 * @returns {Promise<number>} Total number of users
 */
export async function getTotalUsers(): Promise<any> {
  try {
    await connectToDB();
    return await User.countDocuments();
  } catch (error) {
    console.error("Error fetching total users:", error);
    throw error;
  }
}
