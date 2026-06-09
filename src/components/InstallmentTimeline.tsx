"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";

interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
}

interface InstallmentTimelineProps {
  installments: Installment[];
}

export function InstallmentTimeline({ installments }: InstallmentTimelineProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  async function markPaid(id: string) {
    setUpdating(id);
    await fetch(`/api/installments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PAID" }),
    });
    setUpdating(null);
    router.refresh();
  }

  const now = new Date();
  const allPaid = installments.every((i) => i.status === "PAID");

  return (
    <div className="space-y-0">
      {installments.map((inst, i) => {
        const dueDate = new Date(inst.dueDate);
        const isOverdue = inst.status === "PENDING" && dueDate < now;
        const isPaid = inst.status === "PAID";
        const isLast = i === installments.length - 1;

        return (
          <div key={inst.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ${
                  isPaid
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isOverdue
                    ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400"
                    : "bg-white dark:bg-neutral-900 border-amber-400 text-amber-600"
                }`}
              >
                {isPaid ? "✓" : i + 1}
              </div>
              {!isLast && <div className="w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700" />}
            </div>

            <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">${inst.amount.toFixed(2)}</p>
                  <p className="text-sm text-neutral-500">
                    {dueDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={isOverdue ? "OVERDUE" : inst.status} />
                  {inst.status === "PENDING" && (
                    <button
                      onClick={() => markPaid(inst.id)}
                      disabled={updating === inst.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/40 disabled:opacity-50 transition-colors"
                    >
                      {updating === inst.id ? "..." : "Mark paid"}
                    </button>
                  )}
                </div>
              </div>
              {inst.paidAt && (
                <p className="text-xs text-emerald-500 mt-1">
                  Paid on {new Date(inst.paidAt).toLocaleDateString()}
                </p>
              )}
              {isOverdue && (
                <p className="text-xs text-red-500 mt-1">Overdue by {Math.floor((now.getTime() - dueDate.getTime()) / 86400000)} days</p>
              )}
            </div>
          </div>
        );
      })}

      {allPaid && installments.length > 0 && (
        <div className="text-center py-6 text-emerald-600 dark:text-emerald-400 font-medium">
          All installments paid! 🎉
        </div>
      )}
    </div>
  );
}
