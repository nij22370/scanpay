"use client";

import { Button } from "@/components/ui";
import { Card } from "@/components/ui";

export function POSPageContent() {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">POS</h1>
      <Card>
        <p>POS screen content</p>
      </Card>
      <Button>Process Payment</Button>
    </div>
  );
}