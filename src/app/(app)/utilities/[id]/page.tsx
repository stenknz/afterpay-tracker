"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { formatDate } from "@/lib/formatDate";

interface Utility {
  id: string;
  name: string;
  amountDue: number;
  dueDate: string;
  status: string;
  visibility?: string;
  logoPath: string | null;
  notes: string | null;
  userId: string;
  payments: UtilityPayment[];
  user?: { name: string | null; email: string };
}

interface UtilityPayment {
  id: string;
  amount: number;
  paidAt: string;
  notes: string | null;
}

function getStatusColor(status: string): string {
  if (status === "PAID") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600";
  if (status === "PART_PAID") return "bg-amber-50 dark:bg-amber-900/20 text-amber-600";
  return "bg-red-50 dark:bg-red-900/20 text-red-600";
}

export default function UtilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [util, setUtil] = useState<Utility | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecord, setShowRecord] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [payNotes, setPayNotes] = useState("");
  const [editName, setEditName] = useState("");
  const [editAmountDue, setEditAmountDue] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editLogo, setEditLogo] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch(`/api/utilities/${id}`);
    if (!res.ok) { router.push("/utilities"); return; }
    const data = await res.json();
    setUtil(data.utility);
    setCurrentUserId(data.currentUserId);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/set-state-in-effect,react-hooks/exhaustive-deps

  async function handleRecordPayment(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/utilities/${id}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), paidAt, notes: payNotes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowRecord(false);
      setAmount("");
      setPaidAt(new Date().toISOString().slice(0, 10));
      setPayNotes("");
      load();
    }
  }

  async function handleDeletePayment(paymentId: string) {
    if (!confirm("Delete this payment record?")) return;
    await fetch(`/api/utilities/${id}/payments/${paymentId}`, { method: "DELETE" });
    load();
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/utilities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, amountDue: Number(editAmountDue), dueDate: editDueDate, logoPath: editLogo, notes: editNotes || null }),
    });
    setSaving(false);
    if (res.ok) {
      setShowEdit(false);
      load();
    }
  }

  function openEdit() {
    if (!util) return;
    setEditName(util.name);
    setEditAmountDue(util.amountDue.toString());
    setEditDueDate(new Date(util.dueDate).toISOString().slice(0, 10));
    setEditLogo(util.logoPath);
    setEditNotes(util.notes || "");
    setShowEdit(true);
  }

  async function handleDelete() {
    await fetch(`/api/utilities/${id}`, { method: "DELETE" });
    router.push("/utilities");
  }

  if (loading) return <div className="p-6 text-zinc-400">Loading...</div>;
  if (!util) return null;

  const isOwner = util.userId === currentUserId;
  const totalPaid = util.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, util.amountDue - totalPaid);

  return (
    <div className="p-6 space-y-6 max-w-2xl animate-fade-in">
      <Link href="/utilities" className="text-sm text-primary-600 hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Utilities
      </Link>

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            <SafeImage
              src={util.logoPath}
              alt={util.name}
              className="w-full h-full object-contain"
              fallback={<span className="text-2xl font-bold text-primary-600">{util.name[0]}</span>}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{util.name}</h1>
              <span className={`badge ${getStatusColor(util.status)}`}>
                {util.status === "UNPAID" ? "Unpaid" : util.status === "PART_PAID" ? "Part Paid" : "Paid"}
              </span>
            </div>
            <p className="text-lg text-zinc-500">${util.amountDue.toFixed(2)} due</p>
            <p className="text-sm text-zinc-400">
              ${totalPaid.toFixed(2)} paid &middot; ${remaining.toFixed(2)} remaining
              &middot; Due {formatDate(new Date(util.dueDate))}
            </p>
            {util.notes && <p className="text-sm text-zinc-500 mt-1">{util.notes}</p>}
            {!isOwner && util.user && (
              <p className="text-sm text-amber-500 mt-1">{util.user.name || util.user.email}</p>
            )}
          </div>
        </div>
        {isOwner && (
        <div className="mt-3 flex gap-2">
          <button onClick={() => setShowRecord(!showRecord)}
            className="btn btn-primary">
            {showRecord ? "Cancel" : "+ Record Payment"}
          </button>
          <button onClick={openEdit}
            className="btn btn-secondary">
            Edit
          </button>
          <button onClick={() => setShowDelete(true)}
            className="btn bg-zinc-100 dark:bg-zinc-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            Delete
          </button>
        </div>
        )}
      </div>

      {showRecord && (
        <form onSubmit={handleRecordPayment} className="card p-5 space-y-4">
          <h3 className="font-semibold">Record Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount ($)</label>
              <input type="number" step="0.01" min="0" max={remaining} value={amount} onChange={(e) => setAmount(e.target.value)} required
                className="input-field"
                placeholder={remaining.toFixed(2)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Paid</label>
              <input type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)}
              className="input-field" />
          </div>
          <button type="submit" disabled={saving}
            className="btn btn-primary">
            {saving ? "Saving..." : "Save Payment"}
          </button>
        </form>
      )}

      {showEdit && (
        <form onSubmit={handleEditSubmit} className="card p-5 space-y-4">
          <h3 className="font-semibold">Edit Utility Bill</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} required
              className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount Due ($)</label>
              <input type="number" step="0.01" min="0" value={editAmountDue} onChange={(e) => setEditAmountDue(e.target.value)} required
                className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} required
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <LogoUploader currentLogo={editLogo} onUpload={setEditLogo} type="utility" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input type="text" value={editNotes} onChange={(e) => setEditNotes(e.target.value)}
              className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="btn btn-primary">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => setShowEdit(false)}
              className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Payment History</h2>
        {util.payments.length === 0 ? (
          <p className="text-sm text-zinc-400">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {util.payments.map((p) => (
              <div key={p.id} className="card p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-emerald-600">${p.amount.toFixed(2)}</p>
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

      <ConfirmDialog
        open={showDelete}
        title="Delete Utility Bill"
        message="Delete this utility bill and all its payment records? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
