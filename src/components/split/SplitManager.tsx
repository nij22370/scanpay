"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useSplitStore } from "@/store";
import { useCreateSplitSession } from "@/hooks";

export function SplitManager() {
  const participants = useSplitStore((s) => s.participants);
  const addParticipant = useSplitStore((s) => s.addParticipant);
  const updateAssignedAmount = useSplitStore((s) => s.updateAssignedAmount);
  const updateParticipantPayment = useSplitStore((s) => s.updateParticipantPayment);
  const resetSplit = useSplitStore((s) => s.resetSplit);
  const createSplitSession = useCreateSplitSession();

  const totalAssigned = participants.reduce((sum, p) => sum + p.assigned_amount, 0);
  const totalPaid = participants.reduce((sum, p) => sum + p.paid_amount, 0);

  const handleAddParticipant = () => {
    addParticipant({
      user_id: crypto.randomUUID(),
      assigned_amount: 0,
      paid_amount: 0,
      is_paid: false,
    });
  };

  const handleFinalize = () => {
    createSplitSession.mutate({
      transaction_id: "00000000-0000-0000-0000-000000000000",
      total_amount: totalAssigned,
      status: "pending",
      created_by: "system",
    });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Split Bill</h2>
        <button onClick={resetSplit} className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1">
          <X className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span>Total Assigned</span>
        <span className="font-bold">Rs. {totalAssigned}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span>Total Paid</span>
        <span className="font-bold">Rs. {totalPaid}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span>Remaining</span>
        <span className="font-bold">Rs. {totalAssigned - totalPaid}</span>
      </div>

      <AnimatePresence>
        {participants.map((p, index) => (
          <motion.div
            key={p.user_id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-3 border rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Participant {index + 1}</span>
              <span className="text-sm text-muted-foreground">{p.is_paid ? "Paid" : "Pending"}</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-16">Amount</label>
              <input
                type="number"
                value={p.assigned_amount}
                onChange={(e) => {
                  const next = parseFloat(e.target.value) || 0;
                  updateAssignedAmount(p.user_id, next);
                }}
                className="flex-1 p-2 border rounded"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground w-16">Paid</label>
              <input
                type="number"
                value={p.paid_amount}
                onChange={(e) =>
                  updateParticipantPayment(p.user_id, p.assigned_amount, parseFloat(e.target.value) >= p.assigned_amount, p.paid_at)
                }
                className="flex-1 p-2 border rounded"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateParticipantPayment(p.user_id, p.assigned_amount, !p.is_paid, p.is_paid ? null : new Date().toISOString())}
                className={`flex-1 p-2 rounded text-sm font-medium ${
                  p.is_paid
                    ? "bg-green-600 text-white"
                    : "border bg-muted"
                }`}
              >
                {p.is_paid ? "Mark Unpaid" : "Mark Paid"}
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={handleAddParticipant}
        className="w-full p-3 border border-dashed rounded-lg flex items-center justify-center gap-2 hover:bg-accent"
      >
        <Plus className="w-4 h-4" /> Add Participant
      </button>

      <button
        onClick={handleFinalize}
        disabled={participants.length < 2}
        className="w-full p-3 bg-primary text-primary-foreground rounded-lg font-bold disabled:opacity-50"
      >
        Finalize Split
      </button>
    </div>
  );
}
