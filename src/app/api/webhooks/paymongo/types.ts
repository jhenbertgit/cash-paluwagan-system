export type PaymentStatus = "succeeded" | "pending" | "failed";

export interface PaymentIntent {
  attributes: {
    status: PaymentStatus;
    amount: number;
  };
}

export interface WebhookEvent {
  data: {
    id: string;
    attributes: {
      type: string;
      metadata: {
        memberId: string;
      };
      payment_intent: PaymentIntent;
      payment_method_used: string;
    };
  };
}
