"use client";

import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "./SafeImage";
import { CreditCard, CalendarDays, ArrowRight, Building2 } from "lucide-react";

interface StoreT {
  id: string;
  name: string;
  logoPath: string | null;
}

interface Installment {
  id: string;
  amount: number;
  dueDate: Date;
  status: string;
}

interface PaymentCardProps {
  plan: {
    id: string;
    totalAmount: number;
    installmentAmount: number;
    frequency: string;
    startDate: Date;
    status: string;
    title: string | null;
    archivedAt: Date | null;
    store: StoreT | null;
    vendor: { id: string; name: string; logoPath: string | null } | null;
    installments: Installment[];
    userId?: string;
    user?: { id: string; name: string | null; email: string } | null;
  };
  currentUserId?: string;
}

export function PaymentCard({ plan, currentUserId }: PaymentCardProps) {
  const now = new Date();
  const nextDue = plan.installments.find(
    (i) => i.status === "PENDING" && new Date(i.dueDate) >= now
  );
  const overdueCount = plan.installments.filter(
    (i) => i.status === "PENDING" && new Date(i.dueDate) < now
  ).length;
  const paid = plan.installments.filter((i) => i.status === "PAID").length;
  const total = plan.installments.length;
  const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
  const isOwner = !currentUserId || plan.userId === currentUserId;
  const paidAmount = plan.installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  void (plan.totalAmount - paidAmount);

  const freqLabel: Record<string, string> = {
    WEEKLY: "weekly",
    BIWEEKLY: "bi-weekly",
    MONTHLY: "monthly",
  };

  return (
    <Link
      href={`/payments/${plan.id}`}
      className="card p-5 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-zinc-200 dark:ring-zinc-700">
          <SafeImage
            src={plan.store?.logoPath}
            alt={plan.store?.name || "Store"}
            className="w-full h-full object-contain"
            fallback={
              <Building2 className="w-5 h-5 text-zinc-400" />
            }
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-sm truncate">{plan.title || plan.store?.name || "Untitled Plan"}</h3>
            <span className={`badge badge-${plan.status.toLowerCase()}`}>
              {plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}
            </span>
            {plan.archivedAt && (
              <span className="text-xs text-zinc-400 font-medium">Archived</span>
            )}
            {!isOwner && plan.user && (
              <span className="text-xs text-indigo-500 font-medium ml-1">
                {plan.user.name || plan.user.email}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500">
            ${plan.totalAmount.toFixed(2)} &middot; {freqLabel[plan.frequency] || plan.frequency.toLowerCase()}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold tracking-tight">${plan.installmentAmount.toFixed(2)}</p>
          <p className="text-xs text-zinc-500">per payment</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
          <span>{paid}/{total} payments</span>
          <span className={overdueCount > 0 ? "text-red-500 font-medium" : "text-emerald-500 font-medium"}>
            {overdueCount > 0 ? `${overdueCount} overdue` : `${progress}% done`}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className={`progress-bar-fill ${overdueCount > 0 ? "bg-red-500" : "bg-indigo-500"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          {nextDue && (
            <span className="flex items-center gap-1 text-zinc-500">
              <CalendarDays className="w-3 h-3" />
              {formatDate(new Date(nextDue.dueDate))}
            </span>
          )}
          {plan.vendor && (
            <span className="flex items-center gap-1 text-zinc-400">
              <CreditCard className="w-3 h-3" />
              {plan.vendor.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Details
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </Link>
  );
}
