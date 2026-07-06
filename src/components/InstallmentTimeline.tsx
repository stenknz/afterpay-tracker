"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

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
        const effectiveStatus = isOverdue ? "OVERDUE" : inst.status;

        return (
          <div key={inst.id} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                  isPaid
                    ? "text-emerald-500"
                    : isOverdue
                    ? "text-red-400"
                    : "text-zinc-300 dark:text-zinc-600"
                }`}
              >
                {isPaid ? (
                  <CheckCircle2 className="w-7 h-7" />
                ) : isOverdue ? (
                  <AlertCircle className="w-7 h-7" />
                ) : (
                  <Circle className="w-7 h-7" />
                )}
              </div>
              {!isLast && <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-700 group-last:hidden" />}
            </div>

            <div className={`pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">${inst.amount.toFixed(2)}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {formatDate(dueDate)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={effectiveStatus} />
                  {inst.status === "PENDING" && (
                    <button
                      onClick={() => markPaid(inst.id)}
                      disabled={updating === inst.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium hover:bg-emerald-100 dark:hover:bg-emerald-500/20 disabled:opacity-50 transition-all duration-150"
                    >
                      {updating === inst.id ? (
                        <span className="inline-block w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Pay"
                      )}
                    </button>
                  )}
                </div>
              </div>
              {inst.paidAt && (
                <p className="text-xs text-emerald-500 mt-1">
                  Paid on {formatDate(new Date(inst.paidAt))}
                </p>
              )}
              {isOverdue && (
                <p className="text-xs text-red-500 mt-1">
                  Overdue by {Math.floor((now.getTime() - dueDate.getTime()) / 86400000)} days
                </p>
              )}
            </div>
          </div>
        );
      })}

      {allPaid && installments.length > 0 && (
        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            All paid
          </div>
        </div>
      )}
    </div>
  );
}
