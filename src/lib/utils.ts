import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// import qs from "qs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ERROR HANDLER
type ErrorType =
  | "Validation"
  | "Authentication"
  | "NotFound"
  | "Database"
  | "Network"
  | "Unknown";

interface CustomError {
  type: ErrorType;
  message: string;
  code?: number;
}

export const handleError = (error: unknown): never => {
  let customError: CustomError = {
    type: "Unknown",
    message: "An unexpected error occurred",
    code: 500,
  };

  if (error instanceof Error) {
    if (error.message.includes("User ID is required")) {
      customError = {
        type: "Validation",
        message: error.message,
        code: 400,
      };
    } else if (error.message.includes("No user found with ID")) {
      customError = {
        type: "NotFound",
        message: error.message,
        code: 404,
      };
    } else if (error.name === "MongoServerError") {
      customError = {
        type: "Database",
        message: error.message.includes("duplicate key")
          ? "Record already exists"
          : "Database error occurred",
        code: error.message.includes("duplicate key") ? 409 : 500,
      };
    } else if (error.name === "AuthenticationError") {
      customError = {
        type: "Authentication",
        message: "Authentication failed",
        code: 401,
      };
    } else {
      customError = {
        type: "Unknown",
        message: error.message,
        code: 500,
      };
    }
  } else if (typeof error === "string") {
    customError = {
      type: "Unknown",
      message: error,
      code: 500,
    };
  }

  // Log error for debugging
  console.error(`[${customError.type} Error]`, {
    message: customError.message,
    code: customError.code,
    originalError: error,
  });

  throw new Error(`[${customError.type}] ${customError.message}`);
};
