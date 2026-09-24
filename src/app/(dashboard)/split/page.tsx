"use client";

import { SplitManager } from "@/components/split/SplitManager";
import { Users } from "lucide-react";

export default function SplitPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between p-4 md:px-8 border-b bg-white sticky top-0 z-10 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-slate-900">Split Bill Manager</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Divide bills among multiple customers with eSewa, Khalti, FonePay or Cash
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-8">
        <SplitManager />
      </div>
    </div>
  );
}
