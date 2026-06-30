"use client";

import Link from "next/link";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "./SafeImage";

interface Store {
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
    store: Store | null;
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
  const overdue = plan.installments.filter(
    (i) => i.status === "PENDING" && new Date(i.dueDate) < now
  ).length;
  const paid = plan.installments.filter((i) => i.status === "PAID").length;
  const total = plan.installments.length;
  const progress = total > 0 ? Math.round((paid / total) * 100) : 0;
  const isOwner = !currentUserId || plan.userId === currentUserId;
  const paidAmount = plan.installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const amountLeft = plan.totalAmount - paidAmount;

  return (
    <Link
      href={`/payments/${plan.id}`}
      className="block bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
          <SafeImage
            src={plan.store?.logoPath}
            alt={plan.store?.name || "Store"}
            className="w-full h-full object-contain"
            fallback={<svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{plan.title || plan.store?.name || "Untitled Plan"}</h3>
            {plan.vendor?.logoPath && (
              <SafeImage src={plan.vendor.logoPath} alt={plan.vendor.name} className="h-5 w-auto shrink-0" fallback={null} />
            )}
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${plan.status === "ACTIVE" ? "bg-emerald-500" : plan.status === "COMPLETED" ? "bg-blue-500" : "bg-neutral-400"}`} />
              <span className="text-xs text-neutral-500">{plan.status.charAt(0) + plan.status.slice(1).toLowerCase()}</span>
              {plan.archivedAt && <span className="text-xs text-neutral-400 font-medium">Archived</span>}
              {!isOwner && plan.user && (
                <span className="text-xs text-accent-500 font-medium ml-1">
                  {plan.user.name || plan.user.email}
                </span>
              )}
            </div>
          </div>
          <p className="text-sm text-neutral-500">
            ${plan.totalAmount.toFixed(2)} &middot; {plan.frequency.charAt(0) + plan.frequency.slice(1).toLowerCase()}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-lg font-bold">${plan.installmentAmount.toFixed(2)}</p>
          <p className="text-xs text-neutral-500">per installment</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
        {nextDue && <span>Next: {formatDate(new Date(nextDue.dueDate))}</span>}
        {overdue > 0 && <span className="text-red-500 font-medium">{overdue} overdue</span>}
        <span className="ml-auto">{paid}/{total} paid</span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          ${paidAmount.toFixed(2)} of ${plan.totalAmount.toFixed(2)} paid
        </span>
        {amountLeft > 0 && (
          <span className="font-medium text-primary-600">
            ${amountLeft.toFixed(2)} left
          </span>
        )}
      </div>
    </Link>
  );
}
