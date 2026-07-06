import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: "indigo" | "emerald" | "amber" | "red";
  trend?: { value: string; positive?: boolean };
}

const colorMap = {
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", bar: "bg-indigo-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  amber: { bg: "bg-amber-50 dark:bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  red: { bg: "bg-red-50 dark:bg-red-500/10", text: "text-red-600 dark:text-red-400", bar: "bg-red-500" },
};

export function KpiCard({ label, value, icon: Icon, color, trend }: KpiCardProps) {
  const c = colorMap[color];
  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} shrink-0`}>
          <Icon className={`w-[18px] h-[18px] ${c.text}`} />
        </div>
        <div className="h-1 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
          <div className={`h-full rounded-full ${c.bar} w-1/2`} />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold tracking-tight mt-0.5">{value}</p>
        {trend && (
          <p className={`text-xs font-medium mt-1 ${trend.positive !== false ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
