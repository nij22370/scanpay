"use client";

import { useState } from "react";

interface PaymentFormProps {
  amount: number;
  onSubmit: (data: { method: string; reference?: string }) => void;
}

export function PaymentForm({ amount, onSubmit }: PaymentFormProps) {
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ method, reference: reference || undefined });
      }}
      className="space-y-4"
    >
      <div className="text-xl font-bold">Pay Rs. {amount}</div>
      <div className="space-y-2">
        {["esewa", "khalti", "fonepay", "cash", "card"].map((m) => (
          <label key={m} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-accent">
            <input
              type="radio"
              name="payment"
              value={m}
              checked={method === m}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="capitalize">{m}</span>
          </label>
        ))}
      </div>
      <div>
        <label className="text-sm font-medium">Reference (optional)</label>
        <input
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Payment reference number"
        />
      </div>
      <button
        type="submit"
        disabled={!method}
        className="w-full p-3 bg-primary text-primary-foreground rounded-lg disabled:opacity-50"
      >
        Confirm Payment
      </button>
    </form>
  );
}
