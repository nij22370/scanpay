"use client";

import { DateRangePicker } from "@/components/reports/DateRangePicker";
import { useState } from "react";

export function AdminPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Admin</h1>
      <DateRangePicker onFromChange={setDateFrom} onToChange={setDateTo} />
      <div className="p-4 border rounded-lg">
        <h2 className="font-bold mb-2">System Settings</h2>
        <p className="text-sm text-muted-foreground">Settings panel coming soon.</p>
      </div>
    </div>
  );
}
