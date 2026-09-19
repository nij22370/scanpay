"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { convertToBS } from "@/lib/nepali-date";

const STORE_NAME = "Reliance Fresh Mart";
const STORE_LOCATION = "Baneshwor, KTM";
const DEFAULT_CASHIER_NAME = "Rohan Shrestha";
const DEFAULT_COUNTER_ID = "Counter #02";
const TRANSITION_DURATION_SECONDS = 0.2;

interface NavItem {
  href: string;
  label: string;
  iconName: string;
}

const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { href: "/pos", label: "POS Terminal", iconName: "point_of_sale" },
  { href: "/products", label: "Products Catalog", iconName: "inventory_2" },
  { href: "/inventory", label: "Stock Inventory", iconName: "warehouse" },
  { href: "/split", label: "Group Split", iconName: "call_split" },
  { href: "/reports", label: "Sales Reports", iconName: "analytics" },
] as const;

const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin",
  label: "System Settings",
  iconName: "admin_panel_settings",
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const pageTransition = {
  duration: TRANSITION_DURATION_SECONDS,
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const cashierName = useAuthStore((state) => state.cashierName);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeCashierName = useMemo(() => {
    return cashierName || DEFAULT_CASHIER_NAME;
  }, [cashierName]);

  const nepaliDateDisplay = useMemo(() => {
    return `${convertToBS(new Date())} B.S.`;
  }, []);

  const handleLogout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((previousState) => !previousState);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const renderDesktopNavItem = useCallback(
    (item: NavItem) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

      const itemClasses = cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group",
        isActive
          ? "bg-primary text-white shadow-sm font-semibold"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      );

      return (
        <Link key={item.href} href={item.href} className={itemClasses}>
          <span
            className={cn(
              "material-symbols-outlined text-xl transition-colors",
              isActive ? "text-white" : "text-slate-500 group-hover:text-primary"
            )}
          >
            {item.iconName}
          </span>
          <span className="truncate">{item.label}</span>
        </Link>
      );
    },
    [pathname]
  );

  const renderDrawerNavItem = useCallback(
    (item: NavItem) => {
      const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

      const itemClasses = cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-primary text-white shadow-sm font-semibold"
          : "text-slate-700 hover:bg-slate-100"
      );

      return (
        <Link
          key={item.href}
          href={item.href}
          className={itemClasses}
          onClick={handleMobileMenuClose}
        >
          <span className="material-symbols-outlined text-xl">{item.iconName}</span>
          <span>{item.label}</span>
        </Link>
      );
    },
    [pathname, handleMobileMenuClose]
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Desktop Fixed Sidebar (260px) */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-slate-200 bg-white z-30 shadow-[1px_0_4px_rgba(0,0,0,0.02)]">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center p-1.5 shadow-sm">
              <Image
                src="/images/brand-mark.svg"
                alt="ScanPay Brand Mark"
                width={24}
                height={24}
                className="object-contain"
                priority
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                ScanPay POS
              </h1>
              <p className="text-[11px] text-slate-500 truncate">{STORE_NAME}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium">
              {nepaliDateDisplay}
            </span>
            <span className="text-slate-400 truncate">{STORE_LOCATION}</span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Register Modules
          </div>
          {PRIMARY_NAV_ITEMS.map((item) => renderDesktopNavItem(item))}

          <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Management
          </div>
          {renderDesktopNavItem(ADMIN_NAV_ITEM)}
        </nav>

        {/* Cashier profile & logout */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 shadow-sm mb-2">
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-teal-200 shrink-0">
              <Image
                src="/images/cashier-avatar.png"
                alt="Cashier Avatar"
                width={36}
                height={36}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {activeCashierName}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="truncate">{DEFAULT_COUNTER_ID}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-3 py-2 w-full rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-100"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            <span>Close Shift / Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (h-16) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md z-40 flex items-center justify-between px-4 shadow-sm">
        <button
          onClick={handleMobileMenuToggle}
          className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 cursor-pointer transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {isMobileMenuOpen ? "close" : "menu"}
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/images/brand-mark.svg"
            alt="ScanPay Brand Mark"
            width={24}
            height={24}
            className="object-contain"
          />
          <span className="text-base font-bold text-slate-900">ScanPay POS</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-300 ring-2 ring-teal-100">
            <Image
              src="/images/cashier-avatar.png"
              alt="Profile"
              width={32}
              height={32}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </header>

      {/* Mobile Slide-over Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40"
              onClick={handleMobileMenuClose}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: TRANSITION_DURATION_SECONDS }}
              className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white border-r border-slate-200 z-50 pt-20 pb-6 px-3 flex flex-col justify-between shadow-2xl"
            >
              <div className="space-y-1.5 overflow-y-auto">
                <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Register Modules
                </div>
                {PRIMARY_NAV_ITEMS.map((item) => renderDrawerNavItem(item))}

                <div className="pt-4 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Management
                </div>
                {renderDrawerNavItem(ADMIN_NAV_ITEM)}
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-teal-200 shrink-0">
                    <Image
                      src="/images/cashier-avatar.png"
                      alt="Cashier Avatar"
                      width={32}
                      height={32}
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {activeCashierName}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500">{DEFAULT_COUNTER_ID}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-4 py-3 w-full rounded-xl text-sm font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span>Close Shift / Logout</span>
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Dock Navigation (h-16) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-slate-200 bg-white z-30 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
        {PRIMARY_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-12 gap-0.5 cursor-pointer rounded-lg transition-colors",
                isActive ? "text-primary font-semibold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-2xl transition-transform",
                  isActive ? "scale-110 text-primary" : "text-slate-400"
                )}
              >
                {item.iconName}
              </span>
              <span className="text-[10px] font-medium leading-tight">{item.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main Content Area */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-16 lg:pb-0 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={pageTransition}
            className="p-4 md:p-6 lg:p-8"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
