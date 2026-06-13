"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { KpiCard } from "@/components/KpiCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { DoughnutChartCard } from "@/components/charts/DoughnutChartCard";

interface Metrics {
  totalOwed: number;
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  overdueTotal: number;
  activePlans: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  upcomingPayments: { date: string; amount: number }[];
  topStores: { name: string; count: number; totalValue: number }[];
}

interface DashboardData {
  totalOwed: number;
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  overdueTotal: number;
  activePlans: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  upcomingPayments: { date: string; amount: number }[];
  topStores: { name: string; count: number; totalValue: number }[];
  sharedView: boolean;
  own?: Metrics;
  shared?: Metrics;
}

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [shared, setShared] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    fetch(`/api/dashboard${shared ? "?shared=true" : ""}`)
      .then((r) => r.json())
      .then(setData);
  }, [shared]);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const user = session?.user as
    | { name?: string; email?: string; id?: string; avatarPath?: string }
    | undefined;

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { path } = await res.json();
      const profRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarPath: path }),
      });
      if (!profRes.ok) throw new Error(`Profile update failed: ${profRes.status}`);
      await updateSession();
    } catch (e) {
      console.error("Avatar upload error:", e);
      alert("Avatar upload failed. Check console for details.");
    }
    setUploadingAvatar(false);
  }, [updateSession]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <label className="relative group cursor-pointer shrink-0">
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 group-hover:border-primary-400 transition-colors">
              {user?.avatarPath ? (
                <img src={user.avatarPath} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-primary-600">
                  {(user?.name || user?.email || "?")[0].toUpperCase()}
                </span>
              )}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {uploadingAvatar && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </label>
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {user && (
              <p className="text-base text-neutral-500 mt-1">
                Logged in as <span className="font-semibold text-neutral-700 dark:text-neutral-300">{user.name || user.email}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setShared(false)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!shared ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            My View
          </button>
          <button
            onClick={() => setShared(true)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${shared ? "bg-white dark:bg-neutral-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"}`}
          >
            Shared View
          </button>
          <a
            href="/subscriptions"
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors"
          >
            Subscriptions
          </a>
        </div>
      </div>

      {shared && data?.own && data?.shared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-primary-200 dark:border-primary-800 shadow-sm">
            <p className="font-medium text-primary-700 dark:text-primary-300">Your totals</p>
            <p className="text-2xl font-bold text-primary-600">{fmt(data.own.totalOwed)}</p>
            <p className="text-neutral-500">{data.own.activePlans} active plans</p>
          </div>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-accent-200 dark:border-accent-800 shadow-sm">
            <p className="font-medium text-accent-700 dark:text-accent-300">Partner&apos;s shared totals</p>
            <p className="text-2xl font-bold text-accent-600">{fmt(data.shared.totalOwed)}</p>
            <p className="text-neutral-500">{data.shared.activePlans} shared plans</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard label="Total Owed" value={data ? fmt(data.totalOwed) : "—"} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="primary" />
        <KpiCard label="Due in 15d" value={data ? fmt(data.dueNext15) : "—"} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="accent" />
        <KpiCard label="Due in 30d" value={data ? fmt(data.dueNext30) : "—"} icon="M13 10V3L4 14h7v7l9-11h-7z" color="warm" />
        <KpiCard label="Due in 90d" value={data ? fmt(data.dueNext90) : "—"} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="emerald" />
        <KpiCard label="Overdue" value={data ? fmt(data.overdueTotal) : "—"} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" color="rose" />
        <KpiCard label="Active Plans" value={data ? String(data.activePlans) : "—"} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          dueNext15={data?.dueNext15 ?? 0}
          dueNext30={data?.dueNext30 ?? 0}
          dueNext90={data?.dueNext90 ?? 0}
          partnerDueNext15={shared ? data?.shared?.dueNext15 : undefined}
          partnerDueNext30={shared ? data?.shared?.dueNext30 : undefined}
          partnerDueNext90={shared ? data?.shared?.dueNext90 : undefined}
        />
        <LineChartCard
          data={data?.upcomingPayments ?? []}
          partnerData={shared ? data?.shared?.upcomingPayments : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="max-w-md">
          <DoughnutChartCard paid={data?.paidCount ?? 0} pending={data?.pendingCount ?? 0} overdue={data?.overdueCount ?? 0} />
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h3 className="font-semibold mb-3">Top Stores</h3>
          {data && data.topStores.length > 0 ? (
            <div className="space-y-2">
              {data.topStores.map((store, i) => (
                <div key={store.name} className="flex items-center gap-3 py-1.5">
                  <span className="w-5 text-sm font-medium text-neutral-400 text-right shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{store.name}</p>
                    <p className="text-xs text-neutral-500">{store.count} plan{store.count !== 1 ? "s" : ""} &middot; {fmt(store.totalValue)} total</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? "bg-accent-500" : "bg-neutral-300 dark:bg-neutral-600"}`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-400">No stores with active plans yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
