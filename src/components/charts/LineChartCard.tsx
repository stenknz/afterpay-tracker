"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatDate } from "@/lib/formatDate";

interface LineChartCardProps {
  data: { date: string; amount: number }[];
  partnerData?: { date: string; amount: number }[];
}

export function LineChartCard({ data, partnerData }: LineChartCardProps) {
  const hasPartner = partnerData !== undefined && partnerData.length > 0;

  const merged = (() => {
    const allDates = new Set<string>();
    for (const d of data) allDates.add(d.date);
    if (partnerData) for (const d of partnerData) allDates.add(d.date);

    const sorted = Array.from(allDates).sort();
    const ownMap = new Map(data.map((d) => [d.date, d.amount]));
    const partnerMap = partnerData ? new Map(partnerData.map((d) => [d.date, d.amount])) : new Map();

    return sorted.map((date) => ({
      date,
      Yours: ownMap.get(date) || 0,
      ...(hasPartner ? { Partner: partnerMap.get(date) || 0 } : {}),
    }));
  })();

  return (
    <div className="card p-5">
      <h3 className="section-heading mb-4">Upcoming Payments</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 1, height: 1 }}>
          <LineChart data={merged}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#A1A1AA" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatDate(new Date(v))}
            />
            <YAxis tick={{ fontSize: 12, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E4E4E7", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
              labelFormatter={(v) => formatDate(new Date(v as string))}
            />
            {hasPartner && <Legend />}
            <Line
              type="monotone"
              dataKey="Yours"
              stroke="#6366F1"
              strokeWidth={2}
              dot={{ fill: "#6366F1", r: 3 }}
              activeDot={{ r: 5, fill: "#6366F1" }}
            />
            {hasPartner && (
              <Line
                type="monotone"
                dataKey="Partner"
                stroke="#A5B4FC"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={{ fill: "#A5B4FC", r: 3 }}
                activeDot={{ r: 5, fill: "#A5B4FC" }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
