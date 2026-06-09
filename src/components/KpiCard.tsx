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
    <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
