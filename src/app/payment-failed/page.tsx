"use client";

import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4 p-8">
        <span className="material-symbols-outlined text-6xl text-rose-500">error</span>
        <h1 className="text-2xl font-bold text-slate-900">Payment Failed</h1>
        <p className="text-slate-600">Your payment was not completed. Please try again.</p>
        <Link
          href="/pos"
          className="inline-flex items-center gap-2 h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Return to POS
        </Link>
      </div>
    </div>
  );
}
