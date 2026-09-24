"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, RotateCcw, CheckCircle2, ShoppingBag, CreditCard, Sparkles } from "lucide-react";
import { useSplitStore, useCartStore } from "@/store";
import { useCreateSplitSession } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/vat";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", color: "bg-slate-100 text-slate-800 border-slate-300" },
  { id: "esewa", label: "eSewa", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  { id: "khalti", label: "Khalti", color: "bg-purple-50 text-purple-700 border-purple-300" },
  { id: "fonepay", label: "FonePay", color: "bg-red-50 text-red-700 border-red-300" },
] as const;

export function SplitManager() {
  const participants = useSplitStore((s) => s.participants);
  const addParticipant = useSplitStore((s) => s.addParticipant);
  const updateAssignedAmount = useSplitStore((s) => s.updateAssignedAmount);
  const updateParticipantPayment = useSplitStore((s) => s.updateParticipantPayment);
  const resetSplit = useSplitStore((s) => s.resetSplit);
  const createSplitSession = useCreateSplitSession();
  const { addToast } = useToast();

  const cartSubtotal = useCartStore((s) => s.getSubtotal());
  const [totalBill, setTotalBill] = useState<number>(cartSubtotal > 0 ? cartSubtotal : 1000);
  const [participantNames, setParticipantNames] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});

  const totalAssigned = useMemo(() => {
    return participants.reduce((sum, p) => sum + p.assigned_amount, 0);
  }, [participants]);

  const totalPaid = useMemo(() => {
    return participants.reduce((sum, p) => sum + p.paid_amount, 0);
  }, [participants]);

  const remainingToAssign = useMemo(() => {
    return Math.max(0, totalBill - totalAssigned);
  }, [totalBill, totalAssigned]);

  const remainingToPay = useMemo(() => {
    return Math.max(0, totalBill - totalPaid);
  }, [totalBill, totalPaid]);

  const progressPercentage = useMemo(() => {
    if (totalBill <= 0) return 0;
    return Math.min(100, Math.round((totalPaid / totalBill) * 100));
  }, [totalPaid, totalBill]);

  const handleSyncFromCart = useCallback(() => {
    if (cartSubtotal <= 0) {
      addToast("Cart is currently empty", "error");
      return;
    }
    setTotalBill(cartSubtotal);
    addToast(`Synced bill total Rs. ${cartSubtotal.toFixed(2)} from cart`, "success");
  }, [cartSubtotal, addToast]);

  const handleAddParticipant = useCallback(() => {
    const newId = crypto.randomUUID();
    const count = participants.length + 1;
    setParticipantNames((prev) => ({ ...prev, [newId]: `Customer ${count}` }));
    setPaymentMethods((prev) => ({ ...prev, [newId]: "cash" }));
    addParticipant({
      user_id: newId,
      assigned_amount: 0,
      paid_amount: 0,
      is_paid: false,
    });
  }, [participants.length, addParticipant]);

  const handleSplitEqually = useCallback((ways: number) => {
    if (ways <= 0 || totalBill <= 0) return;
    const perPerson = Math.floor((totalBill / ways) * 100) / 100;
    const remainder = Math.round((totalBill - perPerson * ways) * 100) / 100;

    resetSplit();
    const names: Record<string, string> = {};
    const methods: Record<string, string> = {};

    for (let i = 0; i < ways; i++) {
      const newId = crypto.randomUUID();
      const amount = i === 0 ? perPerson + remainder : perPerson;
      names[newId] = `Customer ${i + 1}`;
      methods[newId] = "cash";
      addParticipant({
        user_id: newId,
        assigned_amount: amount,
        paid_amount: 0,
        is_paid: false,
      });
    }
    setParticipantNames(names);
    setPaymentMethods(methods);
    addToast(`Split Rs. ${totalBill.toFixed(2)} equally among ${ways} people`, "success");
  }, [totalBill, resetSplit, addParticipant, addToast]);

  const handleRemoveParticipant = useCallback((userId: string) => {
    const next = participants.filter((p) => p.user_id !== userId);
    useSplitStore.getState().setParticipants(next);
  }, [participants]);

  const handleTogglePayment = useCallback((userId: string, currentIsPaid: boolean, assignedAmount: number) => {
    const nextPaidState = !currentIsPaid;
    const paidAmount = nextPaidState ? assignedAmount : 0;
    const timestamp = nextPaidState ? new Date().toISOString() : null;
    updateParticipantPayment(userId, paidAmount, nextPaidState, timestamp);
  }, [updateParticipantPayment]);

  const handleFinalize = useCallback(() => {
    if (totalPaid < totalBill) {
      addToast(`Remaining Rs. ${remainingToPay.toFixed(2)} unpaid`, "error");
      return;
    }
    createSplitSession.mutate(
      {
        transaction_id: crypto.randomUUID(),
        total_amount: totalBill,
        status: "completed",
        created_by: "cashier",
      },
      {
        onSuccess: () => {
          addToast("Split Session completed successfully!", "success");
          resetSplit();
        },
        onError: () => {
          addToast("Failed to finalize split session", "error");
        },
      }
    );
  }, [totalPaid, totalBill, remainingToPay, createSplitSession, addToast, resetSplit]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner: Bill Setup & Preset Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Total Bill Amount</h2>
            <p className="text-xs text-slate-500">Enter total bill or sync from current POS cart</p>
          </div>
          <div className="flex items-center gap-3">
            {cartSubtotal > 0 && (
              <button
                onClick={handleSyncFromCart}
                className="px-3 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Sync Cart (Rs. {cartSubtotal.toFixed(2)})
              </button>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">Rs.</span>
              <input
                type="number"
                value={totalBill}
                onChange={(e) => setTotalBill(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-40 pl-10 pr-3 py-2 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-right"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mr-2">Quick Split:</span>
          {[2, 3, 4, 5].map((ways) => (
            <button
              key={ways}
              onClick={() => handleSplitEqually(ways)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              {ways} Equal Ways
            </button>
          ))}
          <button
            onClick={resetSplit}
            className="ml-auto px-3 py-1.5 text-xs text-slate-500 hover:text-red-600 cursor-pointer flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset All
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Total Bill</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalBill)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Total Assigned</p>
          <p className={`text-xl font-extrabold mt-1 ${totalAssigned === totalBill ? "text-emerald-600" : "text-amber-600"}`}>
            {formatCurrency(totalAssigned)}
          </p>
          {remainingToAssign > 0 && (
            <p className="text-[10px] text-amber-600 font-medium mt-0.5">Unassigned: {formatCurrency(remainingToAssign)}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Total Collected</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500">Remaining Balance</p>
          <p className={`text-xl font-extrabold mt-1 ${remainingToPay === 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {formatCurrency(remainingToPay)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>Payment Progress</span>
          <span>{progressPercentage}% Collected ({formatCurrency(totalPaid)} / {formatCurrency(totalBill)})</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-emerald-500 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Participants List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Participants ({participants.length})</h3>
          <button
            onClick={handleAddParticipant}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Person
          </button>
        </div>

        <AnimatePresence>
          {participants.map((p, index) => {
            const name = participantNames[p.user_id] || `Customer ${index + 1}`;
            const method = paymentMethods[p.user_id] || "cash";

            return (
              <motion.div
                key={p.user_id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setParticipantNames((prev) => ({ ...prev, [p.user_id]: e.target.value }))
                      }
                      className="font-semibold text-sm text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none px-1 py-0.5 rounded"
                      placeholder="Customer Name"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Method Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.id}
                          onClick={() =>
                            setPaymentMethods((prev) => ({ ...prev, [p.user_id]: m.id }))
                          }
                          className={`px-2 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                            method === m.id ? m.color + " border" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {participants.length > 1 && (
                      <button
                        onClick={() => handleRemoveParticipant(p.user_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500 w-20">Assigned:</label>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rs.</span>
                      <input
                        type="number"
                        value={p.assigned_amount || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateAssignedAmount(p.user_id, val);
                        }}
                        className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-slate-500 w-20">Paid Amt:</label>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">Rs.</span>
                      <input
                        type="number"
                        value={p.paid_amount || ""}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          updateParticipantPayment(
                            p.user_id,
                            val,
                            val >= p.assigned_amount && p.assigned_amount > 0,
                            val >= p.assigned_amount ? new Date().toISOString() : null
                          );
                        }}
                        className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePayment(p.user_id, p.is_paid, p.assigned_amount)}
                    disabled={p.assigned_amount <= 0}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5 ${
                      p.is_paid
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {p.is_paid ? "Marked as Paid" : "Mark Paid"}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {participants.length === 0 && (
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-3">
            <CreditCard className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-500">No participants added yet</p>
            <button
              onClick={handleAddParticipant}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Add First Person
            </button>
          </div>
        )}
      </div>

      {/* Finalize Split Button */}
      <div className="pt-4">
        <button
          onClick={handleFinalize}
          disabled={participants.length === 0 || remainingToPay > 0}
          className="w-full h-14 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-2xl font-bold text-base cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
        >
          <Sparkles className="w-5 h-5" />
          {remainingToPay === 0
            ? "Finalize Split Bill & Generate Slips"
            : `Pay Remaining ${formatCurrency(remainingToPay)} to Finalize`}
        </button>
      </div>
    </div>
  );
}
