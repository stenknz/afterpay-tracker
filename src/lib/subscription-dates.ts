export function getNextPaymentDates(
  dayOfMonth: number,
  count: number,
  fromDate: Date = new Date()
): Date[] {
  const dates: Date[] = [];

  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  let year = today.getFullYear();
  let month = today.getMonth();

  // Find the first upcoming due date (today or in the future)
  while (true) {
    const maxDay = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(dayOfMonth, maxDay);
    const candidate = new Date(year, month, clampedDay);

    if (candidate >= today) {
      dates.push(candidate);
      break;
    }

    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  // Generate subsequent dates by incrementing one calendar month at a time
  while (dates.length < count) {
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
    const maxDay = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(dayOfMonth, maxDay);
    dates.push(new Date(year, month, clampedDay));
  }

  return dates;
}
