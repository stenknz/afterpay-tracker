"use client";

import { useRouter } from "next/navigation";
import { Archive, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";

interface PlanActionsProps {
  planId: string;
  isArchived: boolean;
  allPaid: boolean;
}

export function PlanActions({ planId, isArchived, allPaid }: PlanActionsProps) {
  const router = useRouter();
  const [showDelete, setShowDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleArchive() {
    setBusy(true);
    const res = await fetch(`/api/payment-plans/${planId}/archive`, { method: "POST" });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  async function handleRestore() {
    setBusy(true);
    const res = await fetch(`/api/payment-plans/${planId}/restore`, { method: "POST" });
    if (res.ok) router.refresh();
    setBusy(false);
  }

  async function handleDelete() {
    setBusy(true);
    const res = await fetch(`/api/payment-plans/${planId}`, { method: "DELETE" });
    if (res.ok) router.push("/payments");
    setBusy(false);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isArchived ? (
          <button
            onClick={handleArchive}
            disabled={!allPaid || busy}
            title={!allPaid ? "All installments must be paid before archiving" : "Archive this plan"}
            className="btn btn-secondary"
          >
            <Archive className="w-4 h-4" />
            Archive
          </button>
        ) : (
          <button
            onClick={handleRestore}
            disabled={busy}
            className="btn btn-secondary"
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
        )}
        <button
          onClick={() => setShowDelete(true)}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all duration-150 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Payment Plan"
        message="Delete this payment plan permanently? This cannot be undone."
        onConfirm={() => { setShowDelete(false); handleDelete(); }}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
