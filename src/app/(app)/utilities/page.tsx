"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  payments: { amount: number }[];
  user?: { name: string | null; email: string };
}

interface UtilitiesData {
  utilities: Utility[];
  own: Utility[];
  partner: Utility[];
  totalDue: number;
  totalPaid: number;
  remaining: number;
  activeCount: number;
  overdueCount: number;
  partnerTotalDue: number;
}

function getStatusColor(status: string): string {
  if (status === "PAID") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600";
  if (status === "PART_PAID") return "bg-amber-50 dark:bg-amber-900/20 text-amber-600";
  return "bg-red-50 dark:bg-red-900/20 text-red-600";
}

export default function UtilitiesPage() {
  const router = useRouter();
  const [data, setData] = useState<UtilitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const url = `/api/utilities${shared ? "?shared=true" : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    setData(json);
    setLoading(false);
  }, [shared]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  function resetForm() {
    setName("");
    setAmountDue("");
    setDueDate(new Date().toISOString().slice(0, 10));
    setLogoPath(null);
    setNotes("");
    setVisibility("PRIVATE");
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/utilities/${editId}` : "/api/utilities";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amountDue: Number(amountDue), dueDate, logoPath, notes: notes || null, visibility }),
    });
    setSaving(false);
    if (res.ok) {
      resetForm();
      setShowForm(false);
      load();
    }
  }

  function handleEdit(util: Utility) {
    setEditId(util.id);
    setName(util.name);
    setAmountDue(util.amountDue.toString());
    setDueDate(util.dueDate.slice(0, 10));
    setLogoPath(util.logoPath);
    setNotes(util.notes || "");
    setVisibility(util.visibility || "PRIVATE");
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/utilities/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Utilities</h1>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shrink-0">
          <button onClick={() => setShared(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!shared ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >My View</button>
          <button onClick={() => setShared(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${shared ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >Shared View</button>
        </div>
      </div>

      {shared && data && data.partner.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-primary-200 dark:border-primary-800 shadow-sm">
            <p className="font-medium text-primary-700 dark:text-primary-300">Your totals</p>
            <p className="text-2xl font-bold text-primary-600">${data.totalDue.toFixed(2)}</p>
            <p className="text-zinc-500">{data.activeCount} active bills</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 shadow-sm">
            <p className="font-medium text-amber-700 dark:text-amber-300">Partner&apos;s shared totals</p>
            <p className="text-2xl font-bold text-amber-600">${(data.partnerTotalDue || 0).toFixed(2)}</p>
            <p className="text-zinc-500">{data.partner.length} shared bills</p>
          </div>
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 stagger">
          <div className="card p-4">
            <p className="text-xs text-zinc-500">Total Due</p>
            <p className="text-xl font-bold">${data.totalDue.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-zinc-500">Total Paid</p>
            <p className="text-xl font-bold text-emerald-600">${data.totalPaid.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-zinc-500">Remaining</p>
            <p className="text-xl font-bold text-amber-600">${data.remaining.toFixed(2)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-zinc-500">Active Bills</p>
            <p className="text-xl font-bold">{data.activeCount}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-zinc-500">Overdue</p>
            <p className="text-xl font-bold text-red-600">{data.overdueCount}</p>
          </div>
        </div>
      )}

      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="btn btn-primary"
      >
        {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Utility Bill</>}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold">{editId ? "Edit Utility" : "New Utility Bill"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Service / Provider Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="input-field"
              placeholder="Power" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount Due ($)</label>
              <input type="number" step="0.01" min="0" value={amountDue} onChange={(e) => setAmountDue(e.target.value)} required
                className="input-field"
                placeholder="120.00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required
                className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} type="utility" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              placeholder="e.g. Account #12345" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sharing</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="vis" value="PRIVATE" checked={visibility === "PRIVATE"}
                  onChange={() => setVisibility("PRIVATE")} className="text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">Private</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="vis" value="SHARED" checked={visibility === "SHARED"}
                  onChange={() => setVisibility("SHARED")} className="text-primary-600 focus:ring-primary-500" />
                <span className="text-sm">Shared with partners</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="btn btn-primary">
              {saving ? "Saving..." : editId ? "Save Changes" : "Add Utility"}
            </button>
            <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
              className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-zinc-400">Loading...</div>
      ) : data && data.utilities.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">No utility bills yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {data?.utilities.map((util) => {
            const isPartner = !!util.user;
            const paid = util.payments.reduce((s, p) => s + p.amount, 0);
            const _remaining = Math.max(0, util.amountDue - paid); // eslint-disable-line @typescript-eslint/no-unused-vars
            const pct = util.amountDue > 0 ? Math.min(100, (paid / util.amountDue) * 100) : 0;
            return (
              <div key={util.id} onClick={() => router.push(`/utilities/${util.id}`)}
                className="card p-5 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    <SafeImage
                      src={util.logoPath}
                      alt={util.name}
                      className="w-full h-full object-contain"
                      fallback={<span className="text-lg font-bold text-primary-600">{util.name[0]}</span>}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{util.name}</h3>
                      {!isPartner && util.visibility === "SHARED" && (
                        <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium shrink-0">Shared</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">
                      ${paid.toFixed(2)} / ${util.amountDue.toFixed(2)}
                    </p>
                    <p className="text-xs text-zinc-400">Due {formatDate(new Date(util.dueDate))}</p>
                    {util.notes && <p className="text-xs text-zinc-400 mt-0.5 truncate">{util.notes}</p>}
                    {isPartner && util.user && (
                      <p className="text-xs text-amber-500 mt-1">{util.user.name || util.user.email}</p>
                    )}
                  </div>
                  <div className="flex items-start gap-2 shrink-0">
                    <span className={`badge ${getStatusColor(util.status)}`}>
                      {util.status === "UNPAID" ? "Unpaid" : util.status === "PART_PAID" ? "Part Paid" : "Paid"}
                    </span>
                    {!isPartner && (
                      <div className="flex gap-1">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(util); }}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-primary-600 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(util.id); }}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="progress-bar mt-3">
                  <div className="progress-bar-fill" style={{
                    width: `${pct}%`,
                    backgroundColor: util.status === "PAID" ? "#22c55e" : util.status === "PART_PAID" ? "#F6B45F" : "#C04740",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Utility Bill"
        message="Delete this utility bill? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
