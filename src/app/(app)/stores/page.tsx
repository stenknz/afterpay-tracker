"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { LogoUploader } from "@/components/LogoUploader";
import { SafeImage } from "@/components/SafeImage";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Store {
  id: string;
  name: string;
  logoPath: string | null;
  _count: { paymentPlans: number };
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [logoPath, setLogoPath] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => fetch("/api/stores").then((r) => r.json()).then(setStores);

  useEffect(() => { load(); }, []);

  async function save() {
    const url = editId ? `/api/stores/${editId}` : "/api/stores";
    const method = editId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, logoPath }) });
    setShowForm(false);
    setEditId(null);
    setName("");
    setLogoPath("");
    load();
  }

  async function del() {
    if (!deleteId) return;
    await fetch(`/api/stores/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  function edit(store: Store) {
    setEditId(store.id);
    setName(store.name);
    setLogoPath(store.logoPath || "");
    setShowForm(true);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Stores</h1>
        <button onClick={() => { setShowForm(true); setEditId(null); setName(""); setLogoPath(""); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add Store
        </button>
      </div>

      {showForm && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold">{editId ? "Edit Store" : "New Store"}</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Store Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Nike, Amazon" />
          </div>
          <LogoUploader currentLogo={logoPath} onUpload={setLogoPath} />
          <div className="flex gap-2">
            <button onClick={save} className="btn btn-primary">{editId ? "Save" : "Create"}</button>
            <button onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {stores.map((store) => (
          <div key={store.id} className="card p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
              <SafeImage
                src={store.logoPath}
                alt={store.name}
                className="w-full h-full object-contain"
                fallback={<span className="text-lg font-bold text-primary-600">{store.name[0]}</span>}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{store.name}</p>
              <p className="text-sm text-zinc-500">{store._count.paymentPlans} plans</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => edit(store)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary-600 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setDeleteId(store.id)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {stores.length === 0 && !showForm && (
          <div className="col-span-full text-center py-12 text-zinc-400">No stores yet. Add your first store to get started.</div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete store?"
        message="This will unlink all payment plans. The plans themselves will not be deleted."
        onConfirm={del}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
