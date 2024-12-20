export type PaymentStatus = "succeeded" | "pending" | "failed";

export interface PaymentIntent {
  id: string;
  type: string;
  attributes: {
    status: PaymentStatus;
    amount: number;
  };
}

export interface WebhookEvent {
  data: {
    id: string;
    type: string;
    attributes: {
      payment_intent: PaymentIntent;
      payment_method_used: string;
      metadata: {
        memberId: string;
      };
    };
  };
}
