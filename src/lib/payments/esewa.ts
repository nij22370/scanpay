import crypto from "crypto";
import { environment } from "./env";

export interface EsewaPayload {
  amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  tax_amount: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
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
    amount: amount.toFixed(2),
    total_amount: amount.toFixed(2),
    transaction_uuid: transactionUuid,
    product_code: environment.esewaMerchantCode,
    tax_amount: "0",
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: `${environment.appUrl}/api/payments/esewa/verify`,
    failure_url: `${environment.appUrl}/payment-failed`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
}

export interface EsewaVerifyResponse {
  transaction_code: string;
  total_amount: string;
  status: string;
  transaction_uuid: string;
  product_code: string;
  signature: string;
  signed_field_names: string;
}

export function verifyEsewaResponse(responseData: string): EsewaVerifyResponse | null {
  try {
    const decoded = Buffer.from(responseData, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as EsewaVerifyResponse;

    if (!parsed.transaction_uuid || !parsed.total_amount || !parsed.status) {
      return null;
    }

    if (parsed.product_code && parsed.signature) {
      const message = `${parsed.signed_field_names
        .split(",")
        .map((field) => `${field}=${parsed[field as keyof EsewaVerifyResponse]}`)
        .join(",")}`;
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
  params.set("amount", payload.amount);
  params.set("total_amount", payload.total_amount);
  params.set("product_code", payload.product_code);
  params.set("transaction_uuid", payload.transaction_uuid);
  params.set("tax_amount", payload.tax_amount);
  params.set("product_service_charge", payload.product_service_charge);
  params.set("product_delivery_charge", payload.product_delivery_charge);
  params.set("success_url", payload.success_url);
  params.set("failure_url", payload.failure_url);
  params.set("signed_field_names", payload.signed_field_names);
  params.set("signature", payload.signature);

  return `${environment.esewaGatewayUrl}?${params.toString()}`;
}
