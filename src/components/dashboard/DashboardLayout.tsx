"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { POSScreen } from "@/components/pos/POSScreen";
import { SplitManager } from "@/components/split/SplitManager";
import { LowStockAlerts } from "@/components/pos/LowStockAlerts";
import { SlipsList } from "@/components/slip/SlipsList";
import { useTransactions } from "@/hooks";
import { useSplitSessions } from "@/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout() {
  const { data: transactions } = useTransactions();
  const { data: splitSessions } = useSplitSessions();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4">
          <h1 className="text-xl font-bold">ScanPay</h1>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <LowStockAlerts />
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pos">POS</TabsTrigger>
                <TabsTrigger value="split">Split</TabsTrigger>
                <TabsTrigger value="slips">Slips</TabsTrigger>
              </TabsList>
              <AnimatePresence mode="wait">
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TabsContent value="overview">
                    <DashboardOverview />
                  </TabsContent>
                </motion.div>
                <motion.div key="pos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TabsContent value="pos">
                    <POSScreen />
                  </TabsContent>
                </motion.div>
                <motion.div key="split" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TabsContent value="split">
                    <SplitManager />
                  </TabsContent>
                </motion.div>
                <motion.div key="slips" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <TabsContent value="slips">
                    <SlipsList transactions={transactions ?? []} splitSessions={splitSessions ?? []} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}