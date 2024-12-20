/**
 * @namespace UserTypes
 * @description Types related to user management and authentication
 */

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
 * @namespace TransactionTypes
 * @description Types related to payment processing and transactions
 */

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
  /** Transaction timestamp */
  createdAt: Date;
}

/**
 * @namespace URLTypes
 * @description Types for URL and query parameter handling
 */

/**
 * Parameters for form URL query handling
 */
interface FormUrlQueryParams {
  /** Current search parameters */
  searchParams: string;
  /** Parameter key */
  key: string;
  /** Parameter value */
  value: string | number | null;
}

/**
 * Parameters for URL query handling
 */
interface UrlQueryParams {
  /** Current parameters */
  params: string;
  /** Parameter key */
  key: string;
  /** Parameter value */
  value: string | null;
}

/**
 * Parameters for removing URL query parameters
 */
interface RemoveUrlQueryParams {
  /** Current search parameters */
  searchParams: string;
  /** Keys to remove from URL */
  keysToRemove: string[];
}

/**
 * Properties for search parameter handling
 */
interface SearchParamProps {
  /** Route parameters */
  params: {
    /** Resource identifier */
    id: string;
    /** Transformation type */
    type: TransformationTypeKey;
  };
  /** Search parameters */
  searchParams: { [key: string]: string | string[] | undefined };
}
