const EAN12_PREFIX = "200";
const RANDOM_DIGITS_COUNT = 9;

export function generateRandomEan12(): string {
  let result = EAN12_PREFIX;
  for (let index = 0; index < RANDOM_DIGITS_COUNT; index += 1) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

export interface QrDataPayload {
  id: string;
  name: string;
  price: number;
}

export function buildProductQrData(payload: QrDataPayload): string {
  return JSON.stringify({
    id: payload.id,
    name: payload.name,
    price: payload.price,
  });
}
