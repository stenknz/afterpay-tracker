"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/KpiCard";
import { BarChartCard } from "@/components/charts/BarChartCard";
import { LineChartCard } from "@/components/charts/LineChartCard";
import { DoughnutChartCard } from "@/components/charts/DoughnutChartCard";

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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard label="Total Owed" value={data ? fmt(data.totalOwed) : "—"} icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" color="primary" />
        <KpiCard label="Due in 15d" value={data ? fmt(data.dueNext15) : "—"} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="accent" />
        <KpiCard label="Due in 30d" value={data ? fmt(data.dueNext30) : "—"} icon="M13 10V3L4 14h7v7l9-11h-7z" color="warm" />
        <KpiCard label="Due in 90d" value={data ? fmt(data.dueNext90) : "—"} icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="emerald" />
        <KpiCard label="Overdue" value={data ? fmt(data.overdueTotal) : "—"} icon="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" color="rose" />
        <KpiCard label="Active Plans" value={data ? String(data.activePlans) : "—"} icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" color="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartCard dueNext15={data?.dueNext15 ?? 0} dueNext30={data?.dueNext30 ?? 0} dueNext90={data?.dueNext90 ?? 0} />
        <LineChartCard data={data?.upcomingPayments ?? []} />
      </div>

      <div className="max-w-md">
        <DoughnutChartCard paid={data?.paidCount ?? 0} pending={data?.pendingCount ?? 0} overdue={data?.overdueCount ?? 0} />
      </div>
    </div>
  );
}
