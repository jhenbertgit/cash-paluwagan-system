"use server";

import User from "../database/models/user.model";
import Recipient from "../database/models/recipient.model";
import { connectToDB } from "../database/mongoose";
import { handleError } from "../utils";

interface CashRecipientResult {
  member: string;
}

/**
 * Selects a cash recipient from eligible members who haven't received cash this year.
 * The selection is only made if today is the 30th day of the month.
 *
 * @returns {Promise<CashRecipientResult | null>} The selected member's ID or null if no selection is made.
 */
export async function selectCashRecipient(): Promise<CashRecipientResult | null> {
  try {
    await connectToDB();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Check if today is the 30th day of the month
    if (currentDate.getDate() !== 30) {
      return null;
    }

    // Get all members
    const allMembers = await User.find({}, "_id");
    if (!allMembers.length) return null;

    // Get members who already received cash this year
    const previousRecipients = await Recipient.find({
      cycleYear: currentYear,
    }).select("member");

    // Get eligible members (those who haven't received cash this year)
    const previousRecipientIds = new Set(
      previousRecipients.map((r) => r.member.toString())
    );

    const eligibleMembers = allMembers.filter(
      (member) => !previousRecipientIds.has(member._id.toString())
    );

    if (!eligibleMembers.length) return null;

    // Fisher-Yates shuffle algorithm for true randomness
    for (let i = eligibleMembers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligibleMembers[i], eligibleMembers[j]] = [
        eligibleMembers[j],
        eligibleMembers[i],
      ];
    }

    // Select random member from eligible members
    const selectedMember = eligibleMembers[0];

    // Persist the selected member in the database
    const newRecipient = new Recipient({
      member: selectedMember._id,
      cycleYear: currentYear,
      cycleMonth: currentMonth,
    });

    await newRecipient.save();

    return {
      member: selectedMember._id.toString(),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Retrieves the cash recipient for the current cycle.
 *
 * @returns {Promise<CashRecipientResult | null>} A promise that resolves to an object containing the member ID of the cash recipient, or null if an error occurs.
 */
export async function getCashRecipient(): Promise<CashRecipientResult | null> {
  try {
    await connectToDB();

    // There is always one recipient
    const member = await Recipient.findOne();

    return {
      member: member?.member.toString() || "",
    };
  } catch (error) {
    handleError(error);
    return null;
  }
}
