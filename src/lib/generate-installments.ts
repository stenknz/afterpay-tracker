const INTERVAL_DAYS: Record<string, number> = {
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
};

export function generateInstallments(
  totalAmount: number,
  installmentAmount: number,
  frequency: string,
  startDate: Date
) {
  const count = Math.ceil(totalAmount / installmentAmount);
  const installments = [];
  const interval = INTERVAL_DAYS[frequency] || 30;

  for (let i = 0; i < count; i++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + i * interval);
    const remaining = totalAmount - i * installmentAmount;
    installments.push({
      amount: Math.round(Math.min(installmentAmount, remaining) * 100) / 100,
      dueDate,
      status: "PENDING",
    });
  }

  return installments;
}
