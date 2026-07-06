"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InstallmentPreview } from "./InstallmentPreview";
import { Save } from "lucide-react";
import Link from "next/link";

interface Store {
  id: string;
  name: string;
  logoPath: string | null;
}

interface Vendor {
  id: string;
  name: string;
  logoPath: string | null;
}

interface PaymentFormProps {
  initialData?: {
    id: string;
    storeId: string | null;
    vendorId: string | null;
    totalAmount: number;
    installmentAmount: number;
    frequency: string;
    startDate: string;
    visibility: string;
    title: string | null;
    notes: string | null;
  };
}

export function PaymentForm({ initialData }: PaymentFormProps) {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [storeId, setStoreId] = useState(initialData?.storeId || "");
  const [vendorId, setVendorId] = useState(initialData?.vendorId || "");
  const [totalAmount, setTotalAmount] = useState(initialData?.totalAmount.toString() || "");
  const [installmentAmount, setInstallmentAmount] = useState(initialData?.installmentAmount.toString() || "");
  const [frequency, setFrequency] = useState(initialData?.frequency || "MONTHLY");
  const [startDate, setStartDate] = useState(initialData?.startDate?.slice(0, 10) || "");
  const [visibility, setVisibility] = useState(initialData?.visibility || "PRIVATE");
  const [title, setTitle] = useState(initialData?.title || "");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/stores").then((r) => r.json()).then(setStores);
    fetch("/api/vendors").then((r) => r.json()).then(setVendors);
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
        vendorId: vendorId || null,
        totalAmount: Number(totalAmount),
        installmentAmount: Number(installmentAmount),
        frequency,
        startDate,
        title,
        visibility,
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl animate-fade-in">
      <div className="card p-6 space-y-5">
        <h3 className="section-heading">Plan Details</h3>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g. Apple MacBook Pro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">BNPL Provider</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="input-field"
            >
              <option value="">Select provider</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Store</label>
            <select
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              className="input-field"
            >
              <option value="">Select store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Total Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              required
              className="input-field"
              placeholder="299.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Installment Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={installmentAmount}
              onChange={(e) => setInstallmentAmount(e.target.value)}
              required
              className="input-field"
              placeholder="49.99"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="input-field"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Bi-weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Sharing</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="PRIVATE"
                checked={visibility === "PRIVATE"}
                onChange={() => setVisibility("PRIVATE")}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-600"
              />
              <span className="text-sm">Private</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="SHARED"
                checked={visibility === "SHARED"}
                onChange={() => setVisibility("SHARED")}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 dark:border-zinc-600"
              />
              <span className="text-sm">Shared with partners</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Any additional details..."
          />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="section-heading mb-3">Installment Preview</h3>
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
          className="btn btn-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : initialData ? "Save Changes" : "Create Plan"}
        </button>
        <Link
          href="/payments"
          className="btn btn-secondary"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
