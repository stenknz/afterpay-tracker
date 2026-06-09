"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallmentPreview } from "./InstallmentPreview";

interface Store {
  id: string;
  name: string;
  logoPath: string | null;
}

interface PaymentFormProps {
  initialData?: {
    id: string;
    storeId: string | null;
    totalAmount: number;
    installmentAmount: number;
    frequency: string;
    startDate: string;
    notes: string | null;
  };
}

export function PaymentForm({ initialData }: PaymentFormProps) {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [storeId, setStoreId] = useState(initialData?.storeId || "");
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount.toString() || "");
  const [installmentAmount, setInstallmentAmount] = useState(initialData?.installmentAmount.toString() || "");
  const [frequency, setFrequency] = useState(initialData?.frequency || "MONTHLY");
  const [startDate, setStartDate] = useState(initialData?.startDate?.slice(0, 10) || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/stores").then((r) => r.json()).then(setStores);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const url = initialData ? `/api/payment-plans/${initialData.id}` : "/api/payment-plans";
    const method = initialData ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId: storeId || null,
        totalAmount: Number(totalAmount),
        installmentAmount: Number(installmentAmount),
        frequency,
        startDate,
        notes,
      }),
    });

    if (res.ok) {
      router.push("/payments");
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 space-y-4">
        <h3 className="font-semibold">Plan Details</h3>

        <div>
          <label className="block text-sm font-medium mb-1.5">Store (optional)</label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="">No store</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="299.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Installment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={installmentAmount}
              onChange={(e) => setInstallmentAmount(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="49.99"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
            placeholder="Any additional details..."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800">
        <h3 className="font-semibold mb-3">Installment Preview</h3>
        <InstallmentPreview
          totalAmount={Number(totalAmount) || 0}
          installmentAmount={Number(installmentAmount) || 0}
          frequency={frequency}
          startDate={startDate}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium transition-colors"
        >
          {saving ? "Saving..." : initialData ? "Save Changes" : "Create Plan"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
