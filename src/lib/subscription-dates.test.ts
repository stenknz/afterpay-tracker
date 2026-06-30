import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getNextPaymentDates } from "./subscription-dates";
import { formatDate } from "./formatDate";

function toFormattedList(dates: Date[]): string[] {
  return dates.map((d) => formatDate(d));
}

describe("getNextPaymentDates", () => {
  it("does not skip July when billing on the 18th from mid-June", () => {
    const from = new Date(2026, 5, 14);
    const dates = getNextPaymentDates(18, 4, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "18/06/2026", "18/07/2026", "18/08/2026", "18/09/2026",
    ]);
  });

  it("selects the current month when the due date is still in the future", () => {
    const from = new Date(2026, 5, 10);
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/06/2026", "18/07/2026", "18/08/2026"]);
  });

  it("selects the next month when the due date has already passed", () => {
    const from = new Date(2026, 5, 25);
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/07/2026", "18/08/2026", "18/09/2026"]);
  });

  it("includes today as the upcoming payment when due today", () => {
    const from = new Date(2026, 5, 18, 9, 30, 0);
    const dates = getNextPaymentDates(18, 2, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/06/2026", "18/07/2026"]);
  });

  it("clamps day-of-month to the last valid day of shorter months", () => {
    const from = new Date(2026, 5, 1);
    const dates = getNextPaymentDates(31, 4, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "30/06/2026", "31/07/2026", "31/08/2026", "30/09/2026",
    ]);
  });

  it("handles year rollover from December", () => {
    const from = new Date(2026, 11, 15);
    const dates = getNextPaymentDates(18, 3, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["18/12/2026", "18/01/2027", "18/02/2027"]);
  });

  it("clamps February correctly in a leap year", () => {
    const from = new Date(2028, 0, 1);
    const dates = getNextPaymentDates(31, 2, from);
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["31/01/2028", "29/02/2028"]);
  });

  // --- New billing cycle tests ---

  it("generates quarterly dates", () => {
    const from = new Date(2026, 0, 15);
    const dates = getNextPaymentDates(15, 4, from, "QUARTERLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "15/01/2026", "15/04/2026", "15/07/2026", "15/10/2026",
    ]);
  });

  it("generates bi-annual dates", () => {
    const from = new Date(2026, 2, 10);
    const dates = getNextPaymentDates(10, 3, from, "BI_ANNUAL");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "10/03/2026", "10/09/2026", "10/03/2027",
    ]);
  });

  it("generates yearly dates", () => {
    const from = new Date(2026, 5, 1);
    const dates = getNextPaymentDates(1, 3, from, "YEARLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "01/06/2026", "01/06/2027", "01/06/2028",
    ]);
  });

  it("jumps to next period when current period's date has passed", () => {
    const from = new Date(2026, 6, 20);
    const dates = getNextPaymentDates(15, 2, from, "QUARTERLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["15/10/2026", "15/01/2027"]);
  });
});
