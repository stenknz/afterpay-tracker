import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNextPaymentDates } from "./subscription-dates";
import { formatDate } from "./formatDate";

function toFormattedList(dates: Date[]): string[] {
  return dates.map((d) => formatDate(d));
}

describe("getNextPaymentDates", () => {
  it("does not skip July when billing on the 18th from mid-June", () => {
    const from = new Date(2026, 5, 14); // 14/06/2026
    const dates = getNextPaymentDates(18, 4, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "18/06/2026",
      "18/07/2026",
      "18/08/2026",
      "18/09/2026",
    ]);
  });

  it("selects the current month when the due date is still in the future", () => {
    const from = new Date(2026, 5, 10); // 10/06/2026
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/06/2026", "18/07/2026", "18/08/2026"]);
  });

  it("selects the next month when the due date has already passed", () => {
    const from = new Date(2026, 5, 25); // 25/06/2026
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/07/2026", "18/08/2026", "18/09/2026"]);
  });

  it("includes today as the upcoming payment when due today", () => {
    const from = new Date(2026, 5, 18, 9, 30, 0); // 18/06/2026 09:30
    const dates = getNextPaymentDates(18, 2, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/06/2026", "18/07/2026"]);
  });

  it("clamps day-of-month to the last valid day of shorter months", () => {
    const from = new Date(2026, 5, 1); // 01/06/2026
    const dates = getNextPaymentDates(31, 4, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "30/06/2026",
      "31/07/2026",
      "31/08/2026",
      "30/09/2026",
    ]);
  });

  it("handles year rollover from December", () => {
    const from = new Date(2026, 11, 15); // 15/12/2026
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/12/2026", "18/01/2027", "18/02/2027"]);
  });

  it("clamps February correctly in a leap year", () => {
    const from = new Date(2028, 0, 1); // 01/01/2028 (leap year)
    const dates = getNextPaymentDates(31, 2, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["31/01/2028", "29/02/2028"]);
  });
});
