"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface BarChartCardProps {
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
}

export function BarChartCard({ dueNext15, dueNext30, dueNext90 }: BarChartCardProps) {
  const data = [
    { name: "15 Days", amount: dueNext15 },
    { name: "30 Days", amount: dueNext30 - dueNext15 },
    { name: "90 Days", amount: dueNext90 - dueNext30 },
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <h3 className="font-semibold mb-4">Due Amounts</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "white" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
            />
            <Bar dataKey="amount" fill="#C04740" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
