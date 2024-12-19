"use server";

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
export async function createUser(user: CreateUserParams) {
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
export async function getUserById(userId: string) {
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
export async function updateUser(clerkId: string, user: UpdateUserParams) {
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
export async function deleteUser(clerkId: string) {
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
 * Updates user's credit balance
 * @async
 * @param {string} userId - Database user ID
 * @param {number} creditFee - Amount to modify credits (positive or negative)
 * @returns {Promise<Object>} Updated user object with new credit balance
 * @throws {Error} When credit update fails or user is not found
 */
export async function updateCredits(userId: string, creditFee: number) {
  try {
    await connectToDB();

    const updatedUserCredits = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { creditBalance: creditFee } },
      { new: true }
    );

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return JSON.parse(JSON.stringify(updatedUserCredits));
  } catch (error) {
    handleError(error);
  }
}
