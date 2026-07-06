"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { KpiCard } from "@/components/KpiCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { DoughnutChartCard } from "@/components/charts/DoughnutChartCard";
import { SafeImage } from "@/components/SafeImage";
import { CalendarDays, TrendingUp, CreditCard, Plus, ArrowRight, CircleCheck, AlertTriangle, Wallet } from "lucide-react";

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
  own?: {
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
  };
  shared?: {
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
  };
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
    <div className="space-y-8 animate-fade-in">
      {/* Hero Balance Card */}
      <div className="hero-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <label className="relative group cursor-pointer shrink-0">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden ring-2 ring-indigo-200 dark:ring-indigo-800 group-hover:ring-indigo-400 transition-all">
                  <SafeImage
                    src={user?.avatarPath}
                    alt=""
                    className="w-full h-full object-cover"
                    fallback={
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {(user?.name || user?.email || "?")[0].toUpperCase()}
                      </span>
                    }
                  />
                  <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <svg className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </label>
              <div>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Welcome back</p>
                <h2 className="text-xl font-semibold tracking-tight">{user?.name || user?.email || "User"}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setShared(false)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!shared ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"}`}
                >
                  My View
                </button>
                <button
                  onClick={() => setShared(true)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${shared ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700"}`}
                >
                  Shared View
                </button>
              </div>
              <Link
                href="/subscriptions"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Subscriptions
              </Link>
              <Link
                href="/utilities"
                className="px-3 py-1.5 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Utilities
              </Link>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Outstanding</p>
            <p className="text-4xl lg:text-5xl font-bold balance-number text-zinc-900 dark:text-zinc-100 mt-1">
              {data ? fmt(data.totalOwed) : <span className="inline-block w-40 h-10 skeleton align-middle" />}
            </p>
            <div className="flex items-center justify-end gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-500">{data?.paidCount || 0} paid</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-zinc-500">{data?.pendingCount || 0} pending</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-zinc-500">{data?.overdueCount || 0} overdue</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <KpiCard
          label="Due in 15 days"
          value={data ? fmt(data.dueNext15) : "—"}
          icon={CalendarDays}
          color="indigo"
          trend={{ value: "Next 2 weeks" }}
        />
        <KpiCard
          label="Due in 30 days"
          value={data ? fmt(data.dueNext30) : "—"}
          icon={TrendingUp}
          color="amber"
          trend={{ value: "Coming month" }}
        />
        <KpiCard
          label="Active Plans"
          value={data ? String(data.activePlans) : "—"}
          icon={CreditCard}
          color="emerald"
          trend={{ value: `${data?.activePlans || 0} running` }}
        />
        <KpiCard
          label="Overdue Total"
          value={data ? fmt(data.overdueTotal) : "—"}
          icon={AlertTriangle}
          color="red"
          trend={{ value: `${data?.overdueCount || 0} items`, positive: (data?.overdueCount || 0) === 0 }}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Link
          href="/payments/new"
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          New Plan
        </Link>
        <Link
          href="/payments"
          className="btn btn-secondary"
        >
          <CreditCard className="w-4 h-4" />
          All Plans
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Shared View Summary */}
      {shared && data?.own && data?.shared && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 border-l-4 border-l-indigo-500">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-500" />
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">Your totals</p>
            </div>
            <p className="text-3xl font-bold tracking-tight mt-2">{fmt(data.own.totalOwed)}</p>
            <p className="text-xs text-zinc-500 mt-1">{data.own.activePlans} active plans</p>
          </div>
          <div className="card p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-500" />
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Partner&apos;s shared totals</p>
            </div>
            <p className="text-3xl font-bold tracking-tight mt-2">{fmt(data.shared.totalOwed)}</p>
            <p className="text-xs text-zinc-500 mt-1">{data.shared.activePlans} shared plans</p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard
          dueNext15={shared ? (data?.own?.dueNext15 ?? 0) : (data?.dueNext15 ?? 0)}
          dueNext30={shared ? (data?.own?.dueNext30 ?? 0) : (data?.dueNext30 ?? 0)}
          dueNext90={shared ? (data?.own?.dueNext90 ?? 0) : (data?.dueNext90 ?? 0)}
          partnerDueNext15={shared ? data?.shared?.dueNext15 : undefined}
          partnerDueNext30={shared ? data?.shared?.dueNext30 : undefined}
          partnerDueNext90={shared ? data?.shared?.dueNext90 : undefined}
        />
        <LineChartCard
          data={shared ? (data?.own?.upcomingPayments ?? []) : (data?.upcomingPayments ?? [])}
          partnerData={shared ? data?.shared?.upcomingPayments : undefined}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DoughnutChartCard paid={data?.paidCount ?? 0} pending={data?.pendingCount ?? 0} overdue={data?.overdueCount ?? 0} />

        <div className="card p-5">
          <h3 className="section-heading mb-4">Top Stores</h3>
          {data && data.topStores.length > 0 ? (
            <div className="space-y-3">
              {data.topStores.map((store, i) => (
                <div key={store.name} className="flex items-center gap-3 py-1.5">
                  <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{store.name}</p>
                    <p className="text-xs text-zinc-500">
                      {store.count} plan{store.count !== 1 ? "s" : ""} &middot; {fmt(store.totalValue)} total
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${i === 0 ? "bg-indigo-500" : "bg-zinc-300 dark:bg-zinc-600"}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CircleCheck className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm text-zinc-400">No stores with active plans yet.</p>
              <Link href="/payments/new" className="text-xs text-indigo-500 hover:text-indigo-600 mt-1 font-medium">
                Create your first plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
