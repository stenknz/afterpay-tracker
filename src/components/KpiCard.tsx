interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  color: "primary" | "accent" | "warm" | "emerald" | "rose";
}

const colorMap = {
  primary: "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300",
  accent: "bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-300",
  warm: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300",
  rose: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300",
};

export function KpiCard({ label, value, icon, color }: KpiCardProps) {
  return (
    <div className="fintech-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] tracking-[0.08em] uppercase font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-display font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
      </div>
    </div>
  );
}
