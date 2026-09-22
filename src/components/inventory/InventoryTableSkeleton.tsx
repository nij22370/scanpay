"use client";

import { Skeleton } from "@/components/ui/index";

export function InventoryTableSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left">Product Name</th>
            <th className="px-4 py-3 text-left">Category</th>
            <th className="px-4 py-3 text-left">Current Stock</th>
            <th className="px-4 py-3 text-left">Threshold</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Quick Adjust</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="animate-pulse">
              <td className="px-4 py-3"><Skeleton className="h-4 w-3/4" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-1/2" /></td>
              <td className="px-4 py-3"><Skeleton className="h-8 w-20" /></td>
              <td className="px-4 py-3"><Skeleton className="h-4 w-12" /></td>
              <td className="px-4 py-3"><Skeleton className="h-5 w-16" /></td>
              <td className="px-4 py-3"><Skeleton className="h-8 w-20 flex items-center justify-center gap-2" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}