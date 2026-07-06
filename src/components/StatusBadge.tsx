interface StatusBadgeProps {
  status: string;
}

const labels: Record<string, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  OVERDUE: "Overdue",
  ACTIVE: "Active",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  UNPAID: "Unpaid",
  PART_PAID: "Part Paid",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const cls = `badge badge-${status.toLowerCase().replace("_", "-")}`;
  return (
    <span className={cls}>
      {labels[status] || status}
    </span>
  );
}
