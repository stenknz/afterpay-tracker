"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface DoughnutChartCardProps {
  paid: number;
  pending: number;
  overdue: number;
}

const COLORS = ["#22c55e", "#F6B45F", "#C04740"];

export function DoughnutChartCard({ paid, pending, overdue }: DoughnutChartCardProps) {
  const data = [
    { name: "Paid", value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <h3 className="font-semibold mb-4">Payment Status</h3>
        <div className="h-64 flex items-center justify-center text-neutral-400">No data yet</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <h3 className="font-semibold mb-4">Payment Status</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "white" }}
              formatter={(value: number) => [value, "Installments"]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
