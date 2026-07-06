"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";

import { formatDate } from "@/lib/formatDate";
import { getNextPaymentDates } from "@/lib/subscription-dates";

interface Subscription {
  id: string;
  name: string;
  price: number;
  dayOfMonth: number;
  billingCycle: string;
  logoPath: string | null;
  visibility: string;
  user?: { name: string | null; email: string };
}

function getNextPaymentDate(dayOfMonth: number): string {
  const next = getNextPaymentDates(dayOfMonth, 1);
  return next.length > 0 ? formatDate(next[0]) : "";
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [partnerSubs, setPartnerSubs] = useState<Subscription[]>([]);
  const [ownTotal, setOwnTotal] = useState(0);
  const [partnerTotal, setPartnerTotal] = useState(0);
  const [shared, setShared] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [visibility, setVisibility] = useState("PRIVATE");
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const url = `/api/subscriptions${shared ? "?shared=true" : ""}`;
    const res = await fetch(url);
    const data = await res.json();
    setSubs(data.own || []);
    setPartnerSubs(data.partner || []);
    setOwnTotal(data.ownTotal || 0);
    setPartnerTotal(data.partnerTotal || 0);
    setLoading(false);
  }, [shared]);

  useEffect(() => { load(); }, [load]); // eslint-disable-line react-hooks/set-state-in-effect

  function resetForm() {
    setName("");
    setPrice("");
    setDayOfMonth("");
    setLogoPath(null);
    setVisibility("PRIVATE");
    setBillingCycle("MONTHLY");
    setEditId(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = editId ? `/api/subscriptions/${editId}` : "/api/subscriptions";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price: Number(price), dayOfMonth: Number(dayOfMonth), billingCycle, logoPath, visibility }),
    });
    setSaving(false);
    if (res.ok) {
      resetForm();
      setShowForm(false);
      load();
    }
  }

  function handleEdit(sub: Subscription) {
    setEditId(sub.id);
    setName(sub.name);
    setPrice(sub.price.toString());
    setDayOfMonth(sub.dayOfMonth.toString());
    setLogoPath(sub.logoPath);
    setVisibility(sub.visibility);
    setBillingCycle(sub.billingCycle || "MONTHLY");
    setShowForm(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/subscriptions/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  const freqLabel: Record<string, string> = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
  const allSubs = [...subs, ...partnerSubs];
  const router = useRouter();

  return (
    <div className="p-6 space-y-6 max-w-6xl animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shrink-0">
          <button onClick={() => setShared(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!shared ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >My View</button>
          <button onClick={() => setShared(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${shared ? "bg-white dark:bg-zinc-700 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
          >Shared View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Monthly Cost</p>
          <p className="text-3xl font-bold">
            {shared ? (
              <>
                <span className="text-primary-600">${ownTotal.toFixed(2)}</span>
                {partnerTotal > 0 && (
                  <span className="text-zinc-400 text-xl ml-2">+ ${partnerTotal.toFixed(2)} shared</span>
                )}
              </>
            ) : `$${ownTotal.toFixed(2)}`}
          </p>
        </div>
        <div className="card p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Active Subscriptions</p>
          <p className="text-3xl font-bold">{allSubs.length}</p>
        </div>
      </div>

      <button
        onClick={() => { resetForm(); setShowForm(!showForm); }}
        className="btn btn-primary"
      >
        {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Subscription</>}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 max-w-2xl">
          <h3 className="font-semibold">{editId ? "Edit Subscription" : "New Subscription"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Service Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="input-field"
              placeholder="Netflix" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Price ($)</label>
              <input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required
                className="input-field"
                placeholder="19.99" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Day</label>
              <input type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} required
                className="input-field"
                placeholder="15" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Billing Cycle</label>
            <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}
              className="input-field">
              <option value="MONTHLY">Monthly</option>
              <option value="QUARTERLY">Quarterly</option>
              <option value="BI_ANNUAL">Bi-Annual</option>
              <option value="YEARLY">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Logo</label>
            <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} type="subscription" />
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
              {saving ? "Saving..." : editId ? "Save Changes" : "Add Subscription"}
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
      ) : allSubs.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">No subscriptions yet. Add your first one!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {allSubs.map((sub) => {
            const isPartner = partnerSubs.some((p) => p.id === sub.id);
            return (
              <div key={sub.id} onClick={() => router.push(`/subscriptions/${sub.id}`)}
                className="card p-5 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    <SafeImage
                      src={sub.logoPath}
                      alt={sub.name}
                      className="w-full h-full object-contain"
                      fallback={<span className="text-lg font-bold text-primary-600">{sub.name[0]}</span>}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{sub.name}</h3>
                      {!isPartner && sub.visibility === "SHARED" && (
                        <span className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium shrink-0">Shared</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500">${sub.price.toFixed(2)}{freqLabel[sub.billingCycle || "MONTHLY"]}</p>
                    <p className="text-xs text-zinc-400">Next: {getNextPaymentDate(sub.dayOfMonth)}</p>
                    {isPartner && sub.user && (
                      <p className="text-xs text-amber-500 mt-1">{sub.user.name || sub.user.email}</p>
                    )}
                  </div>
                  {!isPartner && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(sub); }}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-primary-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(sub.id); }}
                        className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Subscription"
        message="Delete this subscription? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
