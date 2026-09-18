import Link from "next/link";
import { Button } from "@/components/ui";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-5xl font-bold mb-4">ScanPay</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-md">
        Nepal payment gateway integration platform — POS, split bills, and
        multi-provider payments (eSewa, Khalti, FonePay).
      </p>
      <div className="flex gap-4">
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>
    </main>
  );
}