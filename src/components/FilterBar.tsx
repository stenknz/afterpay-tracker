"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";

interface Store {
  id: string;
  name: string;
}

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch("/api/stores").then((r) => r.json()).then(setStores);
  }, []);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/payments?${params.toString()}`);
  }

  const hasFilters = searchParams.get("from") || searchParams.get("to") || searchParams.get("storeId") || searchParams.get("status");

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
        <Filter className="w-3.5 h-3.5" />
        Filters
      </div>
      <input
        type="date"
        defaultValue={searchParams.get("from") || ""}
        onChange={(e) => setParam("from", e.target.value)}
        className="input-field w-[140px] text-xs"
        placeholder="From"
      />
      <input
        type="date"
        defaultValue={searchParams.get("to") || ""}
        onChange={(e) => setParam("to", e.target.value)}
        className="input-field w-[140px] text-xs"
        placeholder="To"
      />
      <select
        defaultValue={searchParams.get("storeId") || ""}
        onChange={(e) => setParam("storeId", e.target.value)}
        className="input-field w-[150px] text-xs"
      >
        <option value="">All stores</option>
        {stores.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <select
        defaultValue={searchParams.get("status") || ""}
        onChange={(e) => setParam("status", e.target.value)}
        className="input-field w-[150px] text-xs"
      >
        <option value="">All statuses</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
      </select>
      {hasFilters && (
        <button
          onClick={() => router.push("/payments")}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
    </div>
  );
}
