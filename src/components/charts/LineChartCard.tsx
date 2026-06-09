"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LineChartCardProps {
  data: { date: string; amount: number }[];
}

export function LineChartCard({ data }: LineChartCardProps) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
      <h3 className="font-semibold mb-4">Upcoming Payments</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10 }}
              stroke="#9ca3af"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", background: "white" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
              labelFormatter={(v: string) => new Date(v).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#E88C5E"
              strokeWidth={2}
              dot={{ fill: "#E88C5E", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
