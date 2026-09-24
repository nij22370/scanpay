"use client";

import { ReportsPage } from "@/components/reports/ReportsPage";
import { BarChart2 } from "lucide-react";

export default function ReportsPageRoute() {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between p-4 md:px-8 border-b bg-white sticky top-0 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-slate-900">Financial Reports</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Sales overview, revenue metrics, and transaction receipt audit
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <ReportsPage />
      </div>
    </div>
  );
}
