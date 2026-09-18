export const environment = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  esewaMerchantCode: process.env.ESEWA_MERCHANT_CODE ?? "",
  esewaSecretKey: process.env.ESEWA_SECRET_KEY ?? "",
  esewaGatewayUrl: process.env.NEXT_PUBLIC_ESEWA_GATEWAY_URL ?? "",
  khaltiSecretKey: process.env.KHALTI_SECRET_KEY ?? "",
  khaltiPublicKey: process.env.NEXT_PUBLIC_KHALTI_PUBLIC_KEY ?? "",
  fonepayMerchantCode: process.env.FONEPAY_MERCHANT_CODE ?? "",
  fonepaySecret: process.env.FONEPAY_SECRET ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
