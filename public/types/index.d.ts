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
  paymentMethod?: string;
  /** Error message for failed transactions */
  error?: string;
  /** Transaction timestamp */
  createdAt: Date;
}
