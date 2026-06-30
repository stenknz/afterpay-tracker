# Afterpay Tracker Update — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apple-inspired visual redesign + calendar modal + yearly subscriptions + amount-left-to-pay + archive search fix + paid visibility

**Architecture:** Single Next.js app with SQLite/Prisma backend, Tailwind v4 theming, FullCalendar for calendar. Changes are independent across data model, UI components, and API routes.

**Tech Stack:** Next.js 16, React 19, Prisma 7, SQLite, Tailwind v4, FullCalendar v6, NextAuth v5, Recharts

---

### Task 1: Add billingCycle to Subscription model + migration

**Files:**
- Modify: `prisma/schema.prisma:85-98`
- Run migration

- [ ] **Step 1: Add billingCycle field to Subscription model**

Edit `prisma/schema.prisma` line 90, add `billingCycle` after `dayOfMonth`:

```prisma
model Subscription {
  id           String                @id @default(cuid())
  userId       String
  user         User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String
  price        Float
  dayOfMonth   Int
  billingCycle String                @default("MONTHLY")
  startDate    DateTime              @default(now())
  logoPath     String?
  visibility   String                @default("PRIVATE")
  payments     SubscriptionPayment[]
  createdAt    DateTime              @default(now())
  updatedAt    DateTime              @updatedAt
}
```

- [ ] **Step 2: Run migration**

```powershell
cd C:\opencode\Afterpay_App
npx prisma migrate dev --name add_billing_cycle
npx prisma generate
```

- [ ] **Step 3: Commit**

```powershell
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add billingCycle field to Subscription model"
```

---

### Task 2: Update subscription-dates.ts for all billing cycles

**Files:**
- Modify: `src/lib/subscription-dates.ts`
- Modify: `src/lib/subscription-dates.test.ts`

- [ ] **Step 1: Add billingCycle parameter to functions**

Edit `src/lib/subscription-dates.ts`:

```typescript
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
```

- [ ] **Step 2: Update tests**

Edit `src/lib/subscription-dates.test.ts`:

```typescript
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
    const from = new Date(2026, 0, 15); // 15/01/2026
    const dates = getNextPaymentDates(15, 4, from, "QUARTERLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "15/01/2026", "15/04/2026", "15/07/2026", "15/10/2026",
    ]);
  });

  it("generates bi-annual dates", () => {
    const from = new Date(2026, 2, 10); // 10/03/2026
    const dates = getNextPaymentDates(10, 3, from, "BI_ANNUAL");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "10/03/2026", "10/09/2026", "10/03/2027",
    ]);
  });

  it("generates yearly dates", () => {
    const from = new Date(2026, 5, 1); // 01/06/2026
    const dates = getNextPaymentDates(1, 3, from, "YEARLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, [
      "01/06/2026", "01/06/2027", "01/06/2028",
    ]);
  });

  it("jumps to next period when current period's date has passed", () => {
    const from = new Date(2026, 6, 20); // 20/07/2026
    const dates = getNextPaymentDates(15, 2, from, "QUARTERLY");
    const formatted = toFormattedList(dates);
    assert.deepEqual(formatted, ["15/10/2026", "15/01/2027"]);
  });
});
```

- [ ] **Step 3: Run tests**

```powershell
cd C:\opencode\Afterpay_App
node --test src/lib/subscription-dates.test.ts
```

Expected: All 11 tests PASS

- [ ] **Step 4: Commit**

```powershell
git add src/lib/subscription-dates.ts src/lib/subscription-dates.test.ts
git commit -m "feat: support QUARTERLY, BI_ANNUAL, YEARLY billing cycles for subscriptions"
```

---

### Task 3: Update subscription API routes for billingCycle

**Files:**
- Modify: `src/app/api/subscriptions/route.ts:54`
- Modify: `src/app/api/subscriptions/[id]/route.ts:12`

- [ ] **Step 1: Update POST handler in subscriptions route**

Edit `src/app/api/subscriptions/route.ts` — add `billingCycle` to destructured body and data:

```typescript
  const { name, price, dayOfMonth, billingCycle, logoPath, visibility } = body;

  const sub = await prisma.subscription.create({
    data: {
      userId,
      name,
      price: Number(price),
      dayOfMonth: Number(dayOfMonth),
      billingCycle: billingCycle || "MONTHLY",
      logoPath: logoPath || null,
      visibility: visibility || "PRIVATE",
    },
  });
```

- [ ] **Step 2: Update PUT handler in subscription [id] route**

Edit `src/app/api/subscriptions/[id]/route.ts`:

```typescript
  const { name, price, dayOfMonth, billingCycle, logoPath, visibility } = body;

  const sub = await prisma.subscription.update({
    where: { id, userId },
    data: {
      name,
      price: Number(price),
      dayOfMonth: Number(dayOfMonth),
      billingCycle: billingCycle || "MONTHLY",
      logoPath: logoPath || null,
      visibility: visibility || "PRIVATE",
    },
  });
```

- [ ] **Step 3: Commit**

```powershell
git add src/app/api/subscriptions/route.ts src/app/api/subscriptions/[id]/route.ts
git commit -m "feat: pass billingCycle in subscription API routes"
```

---

### Task 4: Update subscription pages for billingCycle UI

**Files:**
- Modify: `src/app/(app)/subscriptions/page.tsx`
- Modify: `src/app/(app)/subscriptions/[id]/page.tsx`

- [ ] **Step 1: Add billing cycle dropdown to subscription form**

In `src/app/(app)/subscriptions/page.tsx`:
- Add `billingCycle` state variable (default `"MONTHLY"`)
- Add a frequency dropdown in the form (after or alongside day/month input)
- Include `billingCycle` in POST/PUT JSON body
- Show frequency in subscription cards

Edit the form area (after the Payment Day input, around line 167):

```typescript
  const [billingCycle, setBillingCycle] = useState("MONTHLY");
```

In `resetForm`, add `setBillingCycle("MONTHLY")`.

In `handleEdit`:
```typescript
    setBillingCycle((sub as any).billingCycle || "MONTHLY");
```

In the submit body (around line 75):
```typescript
      body: JSON.stringify({ name, price: Number(price), dayOfMonth: Number(dayOfMonth), billingCycle, logoPath, visibility }),
```

Add dropdown after the day/month grid (after line 168):

```tsx
            <div>
              <label className="block text-sm font-medium mb-1">Billing Cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-sm">
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="BI_ANNUAL">Bi-Annual</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
```

Update the price label from `($/mo)` to just `Price ($)`:

```tsx
              <label className="block text-sm font-medium mb-1">Price ($)</label>
```

Update the price display in subscription cards (line 227):

```tsx
                    const freqLabel = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
                    <p className="text-sm text-neutral-500">${sub.price.toFixed(2)}{freqLabel[(sub as any).billingCycle || "MONTHLY"] || "/mo"}</p>
```

- [ ] **Step 2: Update subscription detail page**

In `src/app/(app)/subscriptions/[id]/page.tsx`:

Update the price display (line 140):
```tsx
            const freqLabel = { MONTHLY: "/mo", QUARTERLY: "/qtr", BI_ANNUAL: "/6mo", YEARLY: "/yr" };
            const cycle = (sub as any).billingCycle || "MONTHLY";
            <p className="text-lg text-neutral-500">${sub.price.toFixed(2)}{freqLabel[cycle]}</p>
```

Update the billing description (line 141):
```tsx
            const cycleLabel = { MONTHLY: "month", QUARTERLY: "quarter", BI_ANNUAL: "6 months", YEARLY: "year" };
            <p className="text-sm text-neutral-400">Bills on the {sub.dayOfMonth}{sub.dayOfMonth === 1 ? "st" : sub.dayOfMonth === 2 ? "nd" : sub.dayOfMonth === 3 ? "rd" : "th"} each {cycleLabel[cycle]}</p>
```

Pass `billingCycle` to `getNextPaymentDates` calls (line 82 and elsewhere):

```typescript
  const cycle = (sub as any).billingCycle || "MONTHLY";
  const futureDates = getNextPaymentDates(sub.dayOfMonth, 12, new Date(), cycle);
```

- [ ] **Step 3: Commit**

```powershell
git add src/app/\(app\)/subscriptions/page.tsx src/app/\(app\)/subscriptions/\[id\]/page.tsx
git commit -m "feat: add billing cycle UI to subscription create/edit/detail pages"
```

---

### Task 5: Update calendar API to pass billingCycle

**Files:**
- Modify: `src/app/api/calendar/route.ts:128`

- [ ] **Step 1: Pass billingCycle to generateDatesInRange**

In `src/app/api/calendar/route.ts`, change line 128:

```typescript
    const dates = generateDatesInRange(sub.dayOfMonth, sub.startDate, new Date(from), new Date(to), sub.billingCycle || "MONTHLY");
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/api/calendar/route.ts
git commit -m "feat: pass billingCycle to calendar subscription date generation"
```

---

### Task 6: Auto-transition plan status to COMPLETED when fully paid

**Files:**
- Modify: `src/app/api/installments/[id]/route.ts`

- [ ] **Step 1: Add completion check after marking installment paid**

Edit `src/app/api/installments/[id]/route.ts`:

```typescript
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  const installment = await prisma.paymentInstallment.findUnique({
    where: { id },
    include: { paymentPlan: true },
  });

  if (!installment || installment.paymentPlan.userId !== (session.user as { id: string }).id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.paymentInstallment.update({
    where: { id },
    data: {
      status,
      paidAt: status === "PAID" ? new Date() : null,
    },
  });

  if (status === "PAID") {
    const allInstallments = await prisma.paymentInstallment.findMany({
      where: { paymentPlanId: installment.paymentPlanId },
    });
    const allPaid = allInstallments.every((i) => i.status === "PAID");
    if (allPaid && installment.paymentPlan.status !== "COMPLETED") {
      await prisma.paymentPlan.update({
        where: { id: installment.paymentPlanId },
        data: { status: "COMPLETED" },
      });
    }
  }

  return NextResponse.json(updated);
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/api/installments/\[id\]/route.ts
git commit -m "feat: auto-transition plan status to COMPLETED when all installments paid"
```

---

### Task 7: Fix archive search in API route

**Files:**
- Modify: `src/app/api/payment-plans/route.ts`

- [ ] **Step 1: Add archived param filtering**

Edit `src/app/api/payment-plans/route.ts`:

```typescript
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const storeId = searchParams.get("storeId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const archived = searchParams.get("archived");

  const where: Record<string, unknown> = { userId };
  if (status) where.status = status;
  if (storeId) where.storeId = storeId;
  if (archived === "true") {
    where.archivedAt = { not: null };
  } else {
    where.archivedAt = null;
  }
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/api/payment-plans/route.ts
git commit -m "fix: add archived param filtering to payment-plans API route"
```

---

### Task 8: Add Amount Left to Pay on PaymentCard

**Files:**
- Modify: `src/components/PaymentCard.tsx`

- [ ] **Step 1: Add amount left calculation and display**

Edit `src/components/PaymentCard.tsx`. Add calculation after line 48:

```typescript
  const paidAmount = plan.installments
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);
  const amountLeft = plan.totalAmount - paidAmount;
```

Add the amount left line after the progress bar (before closing `</Link>`):

```tsx
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-neutral-500">
          ${paidAmount.toFixed(2)} of ${plan.totalAmount.toFixed(2)} paid
        </span>
        {amountLeft > 0 && (
          <span className="font-medium text-primary-600">
            ${amountLeft.toFixed(2)} left
          </span>
        )}
      </div>
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/PaymentCard.tsx
git commit -m "feat: add amount left to pay on PaymentCard"
```

---

### Task 9: Add Completed section in payments page

**Files:**
- Modify: `src/app/(app)/payments/page.tsx`

- [ ] **Step 1: Split plans into active and completed groups**

Edit the render section in `src/app/(app)/payments/page.tsx`. After line 67 (`let filtered = plans;`), add:

```typescript
  const activePlans = filtered.filter((p) =>
    p.status !== "COMPLETED"
  );
  const completedPlans = filtered.filter((p) =>
    p.status === "COMPLETED"
  );
```

Replace the grid section (lines 92-99) with:

```tsx
      {activePlans.length > 0 && (
        <div>
          {completedPlans.length > 0 && (
            <h2 className="text-lg font-semibold mb-3 text-neutral-500">Active</h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activePlans.map((plan) => (
              <PaymentCard key={plan.id} plan={plan} currentUserId={userId} />
            ))}
          </div>
        </div>
      )}

      {completedPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-neutral-500 flex items-center gap-2">
            Completed
            <span className="text-xs font-normal text-neutral-400">({completedPlans.length})</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedPlans.map((plan) => (
              <PaymentCard key={plan.id} plan={plan} currentUserId={userId} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="col-span-full text-center py-12 text-neutral-400">
          {params.archived === "true" ? "No archived plans." : "No payment plans found."}
        </div>
      )}
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/\(app\)/payments/page.tsx
git commit -m "feat: separate active and completed plans in payments listing"
```

---

### Task 10: Calendar event click modal + Monday start

**Files:**
- Create: `src/components/EventDetailModal.tsx`
- Modify: `src/components/CalendarView.tsx`

- [ ] **Step 1: Create EventDetailModal component**

Write `src/components/EventDetailModal.tsx`:

```typescript
"use client";

import Link from "next/link";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor: string;
  extendedProps: {
    type?: string;
    status: string;
    amount: number;
    planId?: string;
    utilityId?: string;
    subscriptionId?: string;
    storeName: string;
    userName?: string;
    isOwn: boolean;
  };
}

interface EventDetailModalProps {
  event: CalendarEvent | null;
  onClose: () => void;
}

export function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  if (!event) return null;

  const ep = event.extendedProps;
  const href = ep.type === "utility"
    ? `/utilities/${ep.utilityId}`
    : ep.type === "subscription"
    ? `/subscriptions/${ep.subscriptionId}`
    : `/payments/${ep.planId}`;

  const statusColors: Record<string, string> = {
    PAID: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
    OVERDUE: "bg-red-50 dark:bg-red-900/20 text-red-600",
    PENDING: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
    UNPAID: "bg-red-50 dark:bg-red-900/20 text-red-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-xl border border-neutral-200 dark:border-neutral-800 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.backgroundColor }} />
            <h3 className="font-semibold text-lg">{ep.storeName}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Amount</span>
            <span className="font-semibold">${ep.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Date</span>
            <span className="text-sm">
              {new Date(event.start).toLocaleDateString("en-US", {
                weekday: "short", month: "short", day: "numeric", year: "numeric",
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-neutral-500">Status</span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[ep.status] || "bg-neutral-100 text-neutral-600"}`}>
              {ep.status.charAt(0) + ep.status.slice(1).toLowerCase()}
            </span>
          </div>
          {ep.userName && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500">Owner</span>
              <span className="text-sm text-accent-500">{ep.userName}</span>
            </div>
          )}
        </div>

        <Link
          href={href}
          className="mt-5 block w-full text-center px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update CalendarView to use modal + Monday start**

Edit `src/components/CalendarView.tsx`:

```typescript
"use client";

import { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DayDetailDrawer } from "./DayDetailDrawer";
import { EventDetailModal } from "./EventDetailModal";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    status: string;
    amount: number;
    planId: string;
    storeName: string;
    userName?: string;
    isOwn: boolean;
  };
}

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  async function loadEvents(from: string, to: string) {
    const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => {
    const from = new Date();
    from.setMonth(from.getMonth() - 3);
    const to = new Date();
    to.setMonth(to.getMonth() + 6);
    loadEvents(from.toISOString(), to.toISOString());
  }, []);

  function handleDateClick(info: { dateStr: string }) {
    const dayEvents = events.filter((e) => e.start.startsWith(info.dateStr));
    setSelectedDateEvents(dayEvents);
    setDrawerOpen(true);
  }

  function handleEventClick(info: { event: { extendedProps: Record<string, unknown> } }) {
    const fullEvent = events.find(
      (e) => e.extendedProps.planId === info.event.extendedProps.planId
    );
    if (fullEvent) setSelectedEvent(fullEvent);
  }

  return (
    <>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          firstDay={1}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek",
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          buttonText={{
            today: "Today",
            month: "Month",
            week: "Week",
          }}
          displayEventTime={false}
        />
      </div>
      <DayDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        events={selectedDateEvents}
      />
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </>
  );
}
```

- [ ] **Step 3: Commit**

```powershell
git add src/components/EventDetailModal.tsx src/components/CalendarView.tsx
git commit -m "feat: add event detail modal popup, Monday start for calendar"
```

---

### Task 11: Visual redesign — globals.css

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace palette with Apple-inspired colors**

Edit `src/app/globals.css`:

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, monospace;

  --color-primary-50: #EBF5FF;
  --color-primary-100: #C7E0FF;
  --color-primary-200: #94C5FF;
  --color-primary-300: #5EA8FF;
  --color-primary-400: #2D8CFF;
  --color-primary-500: #007AFF;
  --color-primary-600: #0066D6;
  --color-primary-700: #0052AD;
  --color-primary-800: #003D85;
  --color-primary-900: #00295C;

  --color-accent-50: #FFF9EC;
  --color-accent-100: #FFEDC4;
  --color-accent-200: #FFDC82;
  --color-accent-300: #FFC940;
  --color-accent-400: #FFB800;
  --color-accent-500: #FF9500;
  --color-accent-600: #CC7700;
  --color-accent-700: #995900;
  --color-accent-800: #663B00;
  --color-accent-900: #331E00;
}

@custom-variant dark (&:where(.dark, .dark *));

body {
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/globals.css
git commit -m "feat: Apple-inspired color palette"
```

---

### Task 12: Visual redesign — layout.tsx (Inter font)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Replace Geist with Inter**

Edit `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
```

Update the body className:
```typescript
      <body className={`${inter.variable} font-sans antialiased bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7]`}>
```

- [ ] **Step 2: Commit**

```powershell
git add src/app/layout.tsx
git commit -m "feat: replace Geist with Inter font, update body background colors"
```

---

### Task 13: Visual redesign — update components with new styling

**Files:**
- Modify: Various components

- [ ] **Step 1: Update Sidebar.tsx**

Update the background/frosted glass effect and active link colors:

In `src/components/Sidebar.tsx`, find the desktop sidebar container and add backdrop blur, update active link styles:
- Change `bg-neutral-50 dark:bg-neutral-950` to `bg-white/80 dark:bg-neutral-950/80 backdrop-blur-xl`
- Change active link colors from `bg-primary-50 dark:bg-primary-900/20 text-primary-600` to `bg-primary-50 dark:bg-primary-900/20 text-primary-600` (these already use primary colors which are now blue)

- [ ] **Step 2: Update FilterBar.tsx**

Update input/select borders and focus rings from `ring-primary-500/30` to match new blue accent.

- [ ] **Step 3: Update subscriptions page button colors**

The existing `bg-primary-600 hover:bg-primary-700` buttons automatically get the new blue palette. No explicit changes needed.

- [ ] **Step 4: Update payments page button**

The "New Plan" button uses `bg-primary-600 hover:bg-primary-700` — automatically blue now.

- [ ] **Step 5: Update PayCard**

The progress bar `bg-primary-500` automatically becomes blue now.

- [ ] **Step 6: Verify contrast and spacing across components**

Check that all cards use `rounded-2xl p-5 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all`.

- [ ] **Step 7: Add .superpowers to .gitignore**

Append to `.gitignore`:

```
# brainstorming visual companion
.superpowers/
```

- [ ] **Step 8: Commit**

```powershell
git add .gitignore
git commit -m "chore: add .superpowers to gitignore"
```

- [ ] **Step 9: Final build check**

```powershell
cd C:\opencode\Afterpay_App
npm run build
```

Fix any build errors.

- [ ] **Step 10: Final commit for visual redesign**

```powershell
git add .
git commit -m "feat: Apple-inspired visual redesign across all components"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- [x] Data Model: billingCycle added to Subscription (Tasks 1-5)
- [x] Calendar modal popup on event click (Task 10)
- [x] Monday as first day of week (Task 10)
- [x] Yearly subscription billing cycle (Tasks 1-5)
- [x] Amount Left to Pay on PaymentCard (Task 8)
- [x] Archive search fix in API route (Task 7)
- [x] Paid payments visible (auto-COMPLETED + section, Tasks 6, 9)
- [x] Apple-inspired palette (Task 11)
- [x] Inter typography (Task 12)
- [x] Visual polish (Task 13)
- [x] Deployment — no changes needed per user

**2. Placeholder scan:** No TBD, TODO, or incomplete steps.

**3. Type consistency:** billingCycle matches across all files. getNextPaymentDates and generateDatesInRange signatures consistent.
