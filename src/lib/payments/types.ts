// Payment gateway types
export interface PaymentInitiateResult {
  success: boolean;
  paymentUrl: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentVerifyResult {
  success: boolean;
  transactionId: string;
  status: "completed" | "failed" | "pending";
  message?: string;
}

export interface PaymentGateway {
  name: "esewa" | "khalti" | "fonepay";
  initiate(payload: PaymentInitiatePayload): Promise<PaymentInitiateResult>;
  verify(payload: PaymentVerifyPayload): Promise<PaymentVerifyResult>;
}

export interface PaymentInitiatePayload {
  amount: number;
  transactionId: string;
  metadata?: Record<string, string>;
}

export interface PaymentVerifyPayload {
  transactionId: string;
  providerRefId?: string;
  signature?: string;
}
