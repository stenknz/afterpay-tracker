"use client";

import { useRouter } from "next/navigation";

interface PlanActionsProps {
  planId: string;
  isArchived: boolean;
  allPaid: boolean;
}

export function PlanActions({ planId, isArchived, allPaid }: PlanActionsProps) {
  const router = useRouter();

  async function handleArchive() {
    const res = await fetch(`/api/payment-plans/${planId}/archive`, { method: "POST" });
    if (res.ok) router.refresh();
  }

  async function handleRestore() {
    const res = await fetch(`/api/payment-plans/${planId}/restore`, { method: "POST" });
    if (res.ok) router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this payment plan permanently?")) return;
    const res = await fetch(`/api/payment-plans/${planId}`, { method: "DELETE" });
    if (res.ok) router.push("/payments");
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!isArchived && (
        <button
          onClick={handleArchive}
          disabled={!allPaid}
          title={!allPaid ? "All installments must be paid before archiving" : "Archive this plan"}
          className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
        >
          Archive
        </button>
      )}
      {isArchived && (
        <button
          onClick={handleRestore}
          className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-sm"
        >
          Restore
        </button>
      )}
      <button
        onClick={handleDelete}
        className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm"
      >
        Delete
      </button>
    </div>
  );
}
