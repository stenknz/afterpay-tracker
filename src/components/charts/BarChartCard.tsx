"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface BarChartCardProps {
  dueNext15: number;
  dueNext30: number;
  dueNext90: number;
  partnerDueNext15?: number;
  partnerDueNext30?: number;
  partnerDueNext90?: number;
}

export function BarChartCard({ dueNext15, dueNext30, dueNext90, partnerDueNext15, partnerDueNext30, partnerDueNext90 }: BarChartCardProps) {
  const hasPartner = partnerDueNext15 !== undefined && partnerDueNext30 !== undefined && partnerDueNext90 !== undefined;

  const data = [
    {
      name: "15 Days",
      Yours: dueNext15,
      ...(hasPartner ? { Partner: partnerDueNext15 } : {}),
    },
    {
      name: "30 Days",
      Yours: dueNext30 - dueNext15,
      ...(hasPartner ? { Partner: partnerDueNext30 - partnerDueNext15 } : {}),
    },
    {
      name: "90 Days",
      Yours: dueNext90 - dueNext30,
      ...(hasPartner ? { Partner: partnerDueNext90 - partnerDueNext30 } : {}),
    },
  ];

  return (
    <div className="card p-5">
      <h3 className="section-heading mb-4">Due Amounts</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 1, height: 1 }}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" strokeOpacity={0.5} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#A1A1AA" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #E4E4E7", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, undefined]}
            />
            {hasPartner && <Legend />}
            <Bar dataKey="Yours" fill="#6366F1" radius={[6, 6, 0, 0]} maxBarSize={40} />
            {hasPartner && <Bar dataKey="Partner" fill="#A5B4FC" radius={[6, 6, 0, 0]} maxBarSize={40} />}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
