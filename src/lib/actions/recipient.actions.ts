"use server";

/*eslint-disable @typescript-eslint/no-explicit-any */
import User from "../database/models/user.model";
import Recipient from "../database/models/recipient.model";
import { connectToDB } from "../database/mongoose";
import { getContributionSummary } from "./transaction.action";
import { handleError } from "../utils";

interface CashRecipientResult {
  member: any;
  nextDrawDate: Date;
  amount: number;
}

export async function selectCashRecipient(): Promise<CashRecipientResult | null> {
  try {
    await connectToDB();

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Get all members
    const allMembers = await User.find({});
    if (!allMembers.length) return null;

    // Get members who already received cash this year
    const previousRecipients = await Recipient.find({
      cycleYear: currentYear,
    }).select("member");

    // Get eligible members (those who haven't received cash this year)
    const previousRecipientIds = previousRecipients.map((r) =>
      r.member.toString()
    );

    const eligibleMembers = allMembers.filter(
      (member) => !previousRecipientIds.includes(member._id.toString())
    );

    if (!eligibleMembers.length) return null;

    // Fisher-Yates shuffle algorithm for true randomness
    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    // Select random member from eligible members
    const shuffledMembers = shuffleArray(eligibleMembers);
    const selectedMember = shuffledMembers[0];

    // Calculate next draw date (30th of next month)
    const nextDrawDate = new Date(currentYear, currentMonth, 30);

    // Get total pooled contributions
    const summary = await getContributionSummary();
    const totalPooled = summary.totalAmount || 0;

    return {
      member: selectedMember,
      nextDrawDate,
      amount: totalPooled,
    };
  } catch (error) {
    handleError(error);
    return null;
  }
}
