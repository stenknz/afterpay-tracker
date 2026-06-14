"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/formatDate";

interface Subscription {
  id: string;
  name: string;
  price: number;
  dayOfMonth: number;
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

function getNextPaymentDates(dayOfMonth: number, count: number): Date[] {
  const dates: Date[] = [];
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();

  for (let i = 0; i < count; i++) {
    const maxDay = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(dayOfMonth, maxDay);
    const candidate = new Date(year, month, clampedDay);
    if (candidate <= now || dates.length > 0) {
      month++;
      if (month > 11) { month = 0; year++; }
      const nextMax = new Date(year, month + 1, 0).getDate();
      dates.push(new Date(year, month, Math.min(dayOfMonth, nextMax)));
    } else {
      dates.push(candidate);
      month++;
      if (month > 11) { month = 0; year++; }
    }
  }
  return dates;
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

  useEffect(() => { load(); }, [id]);

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

  if (loading) return <div className="p-6 text-neutral-400">Loading...</div>;
  if (!sub) return null;

  const isOwner = sub.userId === currentUserId;
  const futureDates = getNextPaymentDates(sub.dayOfMonth, 6);

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

  async function handleQuickPay() {
    if (!sub) return;
    setSaving(true);
    await fetch(`/api/subscriptions/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: sub.price, paidAt: new Date().toISOString().slice(0, 10) }),
    });
    setSaving(false);
    load();
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <Link href="/subscriptions" className="text-sm text-primary-600 hover:underline inline-block">&larr; Back to Subscriptions</Link>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
            {sub.logoPath ? (
              <img src={sub.logoPath} alt={sub.name} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-bold text-primary-600">{sub.name[0]}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{sub.name}</h1>
            <p className="text-lg text-neutral-500">${sub.price.toFixed(2)}/mo</p>
            <p className="text-sm text-neutral-400">Bills on the {sub.dayOfMonth}{sub.dayOfMonth === 1 ? "st" : sub.dayOfMonth === 2 ? "nd" : sub.dayOfMonth === 3 ? "rd" : "th"} each month</p>
          </div>
        </div>
      </div>

      {isOwner && (
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors text-sm">
          {showForm ? "Cancel" : "+ Record Payment"}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleRecord} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <h3 className="font-semibold">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
                placeholder={sub.price.toFixed(2)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Paid</label>
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              placeholder="e.g. paid early" />
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium transition-colors text-sm">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-neutral-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <div key={p.id} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold">${p.amount.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400">{formatDate(new Date(p.paidAt))}</p>
                  {p.notes && <p className="text-xs text-neutral-500 mt-0.5">{p.notes}</p>}
                </div>
                {isOwner && (
                  <button onClick={() => handleDeletePayment(p.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
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
            {futureDates.map((date, i) => {
              const paid = paidIndices.has(i);
            return (
              <div key={i} className="bg-white dark:bg-neutral-900 rounded-xl p-4 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <p className={`font-medium ${paid ? "text-emerald-600 line-through" : ""}`}>
                    ${sub.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-neutral-400">{formatDate(date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${paid ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"}`}>
                    {paid ? "Paid" : "Pending"}
                  </span>
                  {isOwner && !paid && (
                    <button onClick={handleQuickPay} disabled={saving}
                      className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-medium transition-colors">
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
