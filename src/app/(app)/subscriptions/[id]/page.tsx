"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/formatDate";
import { SafeImage } from "@/components/SafeImage";
import { getNextPaymentDates } from "@/lib/subscription-dates";

interface Subscription {
  id: string;
  name: string;
  price: number;
  dayOfMonth: number;
  billingCycle: string;
  startDate: string;
  logoPath: string | null;
  visibility: string;
  userId: string;
}

interface Payment {
  id: string;
  amount: number;
  paidAt: string;
  notes: string | null;
}

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [sub, setSub] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/subscriptions/${id}/payments`);
    if (!res.ok) { router.push("/subscriptions"); return; }
    const data = await res.json();
    setSub(data.sub);
    setPayments(data.payments);
    setCurrentUserId(data.userId);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/set-state-in-effect

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/subscriptions/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), paidAt, notes: notes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setAmount("");
      setPaidAt(new Date().toISOString().slice(0, 10));
      setNotes("");
      load();
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/subscriptions/${id}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>;
  if (!sub) return null;

  const isOwner = sub.userId === currentUserId;
  const freqLabel: Record<string, string> = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
  const cycleLabel: Record<string, string> = { MONTHLY: "month", QUARTERLY: "quarter", BI_ANNUAL: "6 months", YEARLY: "year" };
  const cycle = sub.billingCycle || "MONTHLY";
  const futureDates = getNextPaymentDates(sub.dayOfMonth, 12, new Date(), cycle);

  const sortedPayments = [...payments].sort((a, b) =>
    new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
  );
  const paidIndices = new Set<number>();
  let payIdx = 0;
  for (let i = 0; i < futureDates.length; i++) {
    const due = futureDates[i];
    const prevDue = new Date(due);
    prevDue.setMonth(prevDue.getMonth() - 1);
    for (; payIdx < sortedPayments.length; payIdx++) {
      const payDate = new Date(sortedPayments[payIdx].paidAt);
      if (payDate > prevDue && payDate <= due) {
        paidIndices.add(i);
        payIdx++;
        break;
      }
      if (payDate > due) break;
    }
  }
  const upcomingDates = futureDates.filter((_, i) => !paidIndices.has(i)).slice(0, 6);

  async function handleQuickPay(date: Date) {
    if (!sub) return;
    const dateStr = date.toISOString().slice(0, 10);
    const alreadyPaid = payments.some((p) => new Date(p.paidAt).toISOString().slice(0, 10) === dateStr);
    if (alreadyPaid) return;
    setSaving(true);
    const today = new Date();
    await fetch(`/api/subscriptions/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: sub.price,
        paidAt: dateStr,
        notes: `Paid on ${formatDate(today)}`,
      }),
    });
    await load();
    setSaving(false);
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl animate-fade-in">
      <Link href="/subscriptions" className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Subscriptions
      </Link>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={sub.logoPath}
              alt={sub.name}
              className="w-full h-full object-contain"
              fallback={<span className="text-2xl font-bold text-primary-600">{sub.name[0]}</span>}
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{sub.name}</h1>
            <p className="text-lg text-zinc-500">${sub.price.toFixed(2)}{freqLabel[cycle]}</p>
            <p className="text-sm text-zinc-400">Bills on the {sub.dayOfMonth}{sub.dayOfMonth === 1 ? "st" : sub.dayOfMonth === 2 ? "nd" : sub.dayOfMonth === 3 ? "rd" : "th"} each {cycleLabel[cycle]}</p>
          </div>
        </div>
      </div>

      {isOwner && (
        <button onClick={() => setShowForm(!showForm)}
          className="btn btn-primary">
          {showForm ? "Cancel" : "+ Record Payment"}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleRecord} className="card p-5 space-y-4">
          <h3 className="font-semibold">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="input-field"
                placeholder={sub.price.toFixed(2)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Paid</label>
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              placeholder="e.g. paid early" />
          </div>
          <button type="submit" disabled={saving}
            className="btn btn-primary">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">${p.amount.toFixed(2)}</p>
                  <p className="text-xs text-zinc-400">{formatDate(new Date(p.paidAt))}</p>
                  {p.notes && <p className="text-xs text-zinc-500 mt-0.5">{p.notes}</p>}
                </div>
                {isOwner && (
                  <button onClick={() => handleDeletePayment(p.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Upcoming Payments</h2>
        <div className="space-y-2">
            {upcomingDates.map((date, i) => (
              <div key={i} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">${sub.price.toFixed(2)}</p>
                  <p className="text-xs text-zinc-400">{formatDate(date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-pending">Pending</span>
                  {isOwner && (
                    <button onClick={() => handleQuickPay(date)} disabled={saving}
                      className="btn btn-primary">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
