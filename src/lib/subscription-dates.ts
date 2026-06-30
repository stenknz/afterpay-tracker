const BILLING_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  BI_ANNUAL: 6,
  YEARLY: 12,
};

function addMonths(date: Date, months: number): Date {
  let year = date.getFullYear();
  let month = date.getMonth() + months;
  if (month > 11) {
    year += Math.floor(month / 12);
    month = month % 12;
  }
  const maxDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), maxDay));
}

export function getNextPaymentDates(
  dayOfMonth: number,
  count: number,
  fromDate: Date = new Date(),
  billingCycle: string = "MONTHLY"
): Date[] {
  const dates: Date[] = [];
  const monthsInterval = BILLING_MONTHS[billingCycle] || 1;
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());

  let current = new Date(today.getFullYear(), today.getMonth(), 1);

  while (true) {
    const maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const clampedDay = Math.min(dayOfMonth, maxDay);
    const candidate = new Date(current.getFullYear(), current.getMonth(), clampedDay);

    if (candidate >= today) {
      dates.push(candidate);
      break;
    }

    current = addMonths(current, monthsInterval);
  }

  while (dates.length < count) {
    current = addMonths(current, monthsInterval);
    const maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const clampedDay = Math.min(dayOfMonth, maxDay);
    dates.push(new Date(current.getFullYear(), current.getMonth(), clampedDay));
  }

  return dates;
}

export function generateDatesInRange(
  dayOfMonth: number,
  startDate: Date,
  from: Date,
  to: Date,
  billingCycle: string = "MONTHLY"
): Date[] {
  const dates: Date[] = [];
  const monthsInterval = BILLING_MONTHS[billingCycle] || 1;
  const fromTime = from.getTime();
  const toTime = to.getTime();

  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  for (let i = 0; i < 120; i++) {
    const maxDay = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    const clamped = Math.min(dayOfMonth, maxDay);
    const candidate = new Date(current.getFullYear(), current.getMonth(), clamped);
    const t = candidate.getTime();

    if (t >= fromTime && t <= toTime) {
      dates.push(candidate);
    }
    if (t > toTime) break;

    current = addMonths(current, monthsInterval);
  }

  return dates;
}
