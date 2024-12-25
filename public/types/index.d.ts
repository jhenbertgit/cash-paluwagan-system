/**
 * Parameters for creating a new user
 */
interface CreateUserParams {
  /** Unique identifier from Clerk authentication */
  clerkId: string;
  /** User's email address */
  email: string;
  /** User's chosen username */
  username: string;
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** URL to user's profile photo */
  photo: string;
}

/**
 * Parameters for updating an existing user
 */
interface UpdateUserParams {
  /** User's first name */
  firstName: string;
  /** User's last name */
  lastName: string;
  /** User's username */
  username: string;
  /** URL to user's profile photo */
  photo: string;
}
/**
 * Parameters for checkout transaction
 */
interface CheckoutTransactionParams {
  /** Customer's email address */
  email: string;
  /** Customer's full name */
  name: string;

  userId: string;
}

/**
 * Parameters for creating a transaction record
 */
interface CreateTransactionParams {
  /** Transaction identifier */
  checkoutSessionId: string;
  /** Transaction amount */
  amount: number;
  /** User ID of the member */
  memberId: string;
  /** Transaction status */
  status: "completed" | "failed" | "pending";
  /** Payment method used */
  paymentMethod: string;
  /** Error message for failed transactions */
  error?: string;
}

interface TransactionSummary {
  totalAmount: number;
  totalTransactions: number;
  completedAmount: number;
  completedCount: number;
  averageAmount: number;
  minAmount: number;
  maxAmount: number;
  successRate: number;
}

interface TransactionStats {
  totalAmount: number;
  count: number;
  avgAmount: number;
}

interface MemberContributionStats {
  memberId: Types.ObjectId | null;
  memberName: string;
  email: string;
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  lastTransaction: Date | null;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  successRate: number;
}

/**
 * Interface for monthly transaction statistics
 */
interface MonthlyTransactionStats {
  month: Date;
  totalAmount: number;
  count: number;
}

/**
 * Interface for a populated member object
 */
interface PopulatedMember {
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * Interface for a transaction object with populated member details
 */
interface PopulatedTransaction extends Omit<ITransaction, "member"> {
  member: PopulatedMember;
}
