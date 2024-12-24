"use client";

import { processContribution } from "@/lib/actions/transaction.action";
import { useState } from "react";

interface PaymentFormProps {
  userId: string;
  name: string;
  email: string;
}

export const PaymentForm = ({ userId, name, email }: PaymentFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      await processContribution({ userId, name, email });
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className={`button-primary w-full ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Processing..." : "Proceed to Payment"}
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">
        By clicking above, you will be redirected to PayMongo&apos;s secure
        payment page
      </p>
    </div>
  );
};
