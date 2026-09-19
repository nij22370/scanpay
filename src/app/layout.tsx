import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "ScanPay POS — Modern Retail POS & Payment Gateway Platform",
  description: "High-speed retail POS terminal with integrated Nepal digital wallets (eSewa, Khalti, FonePay) and B.S. calendar support.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-accent selection:text-accent-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}