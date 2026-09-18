"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ShoppingBag, Package, Split, FileText, BarChart3, Settings, LogOut } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/pos", label: "POS", icon: ShoppingBag },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/inventory", label: "Inventory", icon: Package },
  { href: "/dashboard/split", label: "Split", icon: Split },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/admin", label: "Admin", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-card p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold">ScanPay</h2>
        <p className="text-xs text-muted-foreground">Nepal Payment Platform</p>
      </div>
      <nav className="space-y-1 flex-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-accent text-muted-foreground">
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </aside>
  );
}