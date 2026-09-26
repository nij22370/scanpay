import crypto from "crypto";
import { environment } from "./env";

export interface EsewaPayload {
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  tax_amount: string;
  success_url: string;
  failure_url: string;
  signed_fields: string;
  signature: string;
}

export function generateEsewaSignature(
  amount: number,
  transactionUuid: string
): string {
  const message = `total_amount=${amount.toFixed(2)},transaction_uuid=${transactionUuid},product_code=${environment.esewaMerchantCode}`;
  const hmac = crypto.createHmac("sha256", environment.esewaSecretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

export function buildEsewaPayload(
  amount: number,
  transactionUuid: string
): EsewaPayload {
  const signature = generateEsewaSignature(amount, transactionUuid);

  return {
    total_amount: amount.toFixed(2),
    transaction_uuid: transactionUuid,
    product_code: environment.esewaMerchantCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    tax_amount: "0",
    success_url: `${environment.appUrl}/api/payments/esewa/verify`,
    failure_url: `${environment.appUrl}/payment-failed`,
    signed_fields: "total_amount,transaction_uuid,product_code",
    signature,
  };
}

export interface EsewaVerifyResponse {
  transaction_uuid: string;
  total_amount: string;
  status: string;
  txn_id: string;
  paid_amount?: string;
  product_code?: string;
  signature?: string;
  payment_type?: string;
  net_amount?: string;
  merchant_id?: string;
}

export function verifyEsewaResponse(responseData: string): EsewaVerifyResponse | null {
  try {
    const decoded = Buffer.from(responseData, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as EsewaVerifyResponse;

    if (!parsed.transaction_uuid || !parsed.total_amount) {
      return null;
    }

    if (parsed.product_code && parsed.signature) {
      const message = `total_amount=${parsed.total_amount},transaction_uuid=${parsed.transaction_uuid},product_code=${parsed.product_code}`;
      const hmac = crypto.createHmac("sha256", environment.esewaSecretKey);
      hmac.update(message);
      const expectedSignature = hmac.digest("base64");

      if (parsed.signature !== expectedSignature) {
        return null;
      }
    }

    return parsed;
  } catch {
    return null;
  }
}

export function buildEsewaUrl(payload: EsewaPayload): string {
  const params = new URLSearchParams();
  params.set("total_amount", payload.total_amount);
  params.set("product_code", payload.product_code);
  params.set("transaction_uuid", payload.transaction_uuid);
  params.set("success_url", payload.success_url);
  params.set("failure_url", payload.failure_url);
  params.set("signed_fields", payload.signed_fields);
  params.set("signature", payload.signature);

  return `${environment.esewaGatewayUrl}?${params.toString()}`;
}
